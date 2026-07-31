import { redisClient } from '../config/redis';
import { logger } from './logger';

/**
 * Enterprise Redis Cache Utility with automatic Graceful Fallback
 */
export class CacheService {
  /**
   * Fetch data from Redis cache or execute fallback DB query and cache result
   */
  static async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    try {
      if (redisClient.isOpen) {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          try {
            return JSON.parse(String(cachedData)) as T;
          } catch (jsonErr) {
            logger.warn(`Redis JSON parse error for key ${key}, clearing key and falling back to DB:`, jsonErr);
            await redisClient.del(key).catch(() => {});
          }
        }
      }
    } catch (err) {
      logger.warn(`Redis get error for key ${key}, falling back to DB:`, err);
    }

    // Execute database fetch function
    const freshData = await fetchFn();

    // Cache the fresh data in Redis if available
    try {
      if (redisClient.isOpen && freshData !== null && freshData !== undefined) {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(freshData));
      }
    } catch (err) {
      logger.warn(`Redis set error for key ${key}:`, err);
    }

    return freshData;
  }

  /**
   * Directly delete key or array of keys from Redis
   */
  static async invalidate(keys: string | string[]): Promise<void> {
    try {
      if (!redisClient.isOpen) return;

      const keyList = Array.isArray(keys) ? keys : [keys];
      if (keyList.length > 0) {
        await Promise.all(keyList.map((k) => redisClient.del(k)));
      }
    } catch (err) {
      logger.warn('Redis invalidation error:', err);
    }
  }

  /**
   * Invalidate all keys matching a pattern (e.g. "cache:jobs:*")
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!redisClient.isOpen) return;

      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => redisClient.del(k)));
      }
    } catch (err) {
      logger.warn(`Redis pattern invalidation error for ${pattern}:`, err);
    }
  }
}
