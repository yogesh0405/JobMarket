import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

export const rateLimiter = (prefix: string, maxRequests: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient.isOpen || !redisClient.isReady) {
      // If redis is down, fallback to allowing the request
      return next();
    }

    const rawForwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (req.headers['cf-connecting-ip'] as string) ||
      (typeof rawForwarded === 'string' ? rawForwarded.split(',')[0].trim() : null) ||
      (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1' ? req.ip : null) ||
      req.socket.remoteAddress ||
      'unknown';

    const key = `ratelimit:${prefix}:${clientIp}`;

    try {
      const results = await redisClient
        .multi()
        .incr(key)
        .ttl(key)
        .exec();

      const current = Number(results[0]);
      let ttl = Number(results[1]);

      // If key is newly created (ttl === -1) or missing ttl, set expiry immediately
      if (ttl === -1 || ttl <= 0) {
        await redisClient.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      if (current > maxRequests) {
        logger.warn(`Rate limit exceeded for IP: ${clientIp} on ${prefix} (${current}/${maxRequests})`);
        res.setHeader('Retry-After', String(Math.max(1, ttl)));
        return res.status(429).json({
          success: false,
          error: `Too many requests. Please try again in ${Math.max(1, ttl)} seconds.`,
          message: `Too many requests. Please try again in ${Math.max(1, ttl)} seconds.`,
          retryAfter: Math.max(1, ttl),
          data: null,
          errors: ['RATE_LIMIT_EXCEEDED']
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', error);
      next(); // Fail open
    }
  };
};
