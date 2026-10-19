import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

// Resilient Sliding Window In-Memory Store
interface SlidingWindowRecord {
  timestamps: number[];
  lastSeen: number;
}

const inMemoryStore = new Map<string, SlidingWindowRecord>();

// Periodic in-memory garbage collector to prevent memory leaks (every 2 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes inactive
  for (const [key, record] of inMemoryStore.entries()) {
    if (now - record.lastSeen > maxAge) {
      inMemoryStore.delete(key);
    }
  }
}, 120000).unref();

export const extractClientIp = (req: Request): string => {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) return cfIp.trim();

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

export const rateLimiter = (prefix: string, maxRequests: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Bypass CORS preflight requests completely
    if (req.method === 'OPTIONS') {
      return next();
    }

    // 2. Bypass health check endpoints
    const path = req.path || req.originalUrl || '';
    if (path === '/health' || path === '/api/health' || path === '/api/v1/health') {
      return next();
    }

    const clientIp = extractClientIp(req);

    // 3. In local development or loopback testing, allow high headroom so devs are never blocked
    const isLoopback = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || clientIp === 'localhost';
    const effectiveMax = isLoopback && process.env.NODE_ENV !== 'production'
      ? Math.max(maxRequests, 1000)
      : maxRequests;

    const key = `ratelimit:${prefix}:${clientIp}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    // 4. Primary: Redis Atomic Sliding Window Log (ZSET)
    if (redisClient.isOpen && redisClient.isReady) {
      try {
        const uniqueMember = `${now}:${Math.random().toString(36).substring(2, 7)}`;
        
        const multi = redisClient.multi();
        // Remove all requests older than the sliding window
        multi.zRemRangeByScore(key, 0, windowStart);
        // Add current request timestamp
        multi.zAdd(key, { score: now, value: uniqueMember });
        // Count entries in the current window
        multi.zCard(key);
        // Set expiry on the whole set so it cleans up when idle
        multi.expire(key, windowSeconds + 5);

        const results = await multi.exec();
        const currentCount = Number(results[2] || 0);

        const remaining = Math.max(0, effectiveMax - currentCount);
        res.setHeader('RateLimit-Limit', String(effectiveMax));
        res.setHeader('RateLimit-Remaining', String(remaining));
        res.setHeader('RateLimit-Reset', String(windowSeconds));

        if (currentCount > effectiveMax) {
          logger.warn(`Rate limit exceeded for IP: ${clientIp} on ${prefix} (${currentCount}/${effectiveMax})`);
          res.setHeader('Retry-After', String(windowSeconds));
          return res.status(429).json({
            success: false,
            error: `Too many requests. Please wait ${windowSeconds} seconds before trying again.`,
            message: `Too many requests. Please wait ${windowSeconds} seconds before trying again.`,
            retryAfter: windowSeconds,
            data: null,
            errors: ['RATE_LIMIT_EXCEEDED']
          });
        }

        return next();
      } catch (redisErr) {
        logger.error('Redis sliding window error, failing over to in-memory store:', redisErr);
      }
    }

    // 5. Fallback: In-Memory Sliding Window Log
    try {
      let record = inMemoryStore.get(key);
      if (!record) {
        record = { timestamps: [], lastSeen: now };
        inMemoryStore.set(key, record);
      }

      // Purge timestamps older than the sliding window
      record.timestamps = record.timestamps.filter(ts => ts > windowStart);
      record.lastSeen = now;

      const currentCount = record.timestamps.length + 1;
      const remaining = Math.max(0, effectiveMax - currentCount);

      res.setHeader('RateLimit-Limit', String(effectiveMax));
      res.setHeader('RateLimit-Remaining', String(remaining));
      res.setHeader('RateLimit-Reset', String(windowSeconds));

      if (record.timestamps.length >= effectiveMax) {
        const oldest = record.timestamps[0] || windowStart;
        const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

        logger.warn(`In-memory rate limit exceeded for IP: ${clientIp} on ${prefix} (${record.timestamps.length}/${effectiveMax})`);
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({
          success: false,
          error: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
          message: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
          retryAfter,
          data: null,
          errors: ['RATE_LIMIT_EXCEEDED']
        });
      }

      record.timestamps.push(now);
      return next();
    } catch (inMemErr) {
      logger.error('In-memory rate limiter fail-open error:', inMemErr);
      return next(); // Fail open for resilience
    }
  };
};
