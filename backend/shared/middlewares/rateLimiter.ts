import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

// Resilient Bounded In-Memory Store with automatic cleanup
const inMemoryRateStore = new Map<string, { count: number; expiresAt: number }>();

// Periodic in-memory cleanup to prevent memory leaks (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of inMemoryRateStore.entries()) {
    if (now > val.expiresAt) {
      inMemoryRateStore.delete(key);
    }
  }
}, 300000).unref();

export const rateLimiter = (prefix: string, maxRequests: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${prefix}:${ip}`;

    try {
      if (redisClient.isOpen && redisClient.isReady) {
        // Atomic transaction: INCR + Check TTL
        const results = await redisClient
          .multi()
          .incr(key)
          .ttl(key)
          .exec();

        const current = Number(results[0]);
        const ttl = Number(results[1]);

        if (ttl === -1) {
          await redisClient.expire(key, windowSeconds);
        }

        if (current > maxRequests) {
          logger.warn(`Rate limit exceeded for IP: ${ip} on ${prefix}`);
          return res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later',
            data: null,
            errors: ['RATE_LIMIT_EXCEEDED']
          });
        }
        return next();
      }
    } catch (error) {
      logger.error('Redis rate limiter error, falling back to in-memory store:', error);
    }

    // Resilient In-Memory Sliding Window Fallback
    const now = Date.now();
    const existing = inMemoryRateStore.get(key);

    if (!existing || now > existing.expiresAt) {
      inMemoryRateStore.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
      return next();
    }

    existing.count += 1;
    if (existing.count > maxRequests) {
      logger.warn(`In-memory rate limit exceeded for IP: ${ip} on ${prefix}`);
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        data: null,
        errors: ['RATE_LIMIT_EXCEEDED']
      });
    }

    next();
  };
};
