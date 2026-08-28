import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

export const rateLimiter = (prefix: string, maxRequests: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient.isOpen) {
      // If redis is down, fallback to allowing the request
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${prefix}:${ip}`;

    try {
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
          errors: []
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', error);
      next(); // Fail open
    }
  };
};
