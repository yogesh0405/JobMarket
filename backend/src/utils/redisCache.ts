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
      if (redisClient.isOpen && redisClient.isReady) {
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
      if (redisClient.isOpen && redisClient.isReady && freshData !== null && freshData !== undefined) {
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
      if (!redisClient.isOpen || !redisClient.isReady) return;

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
      if (!redisClient.isOpen || !redisClient.isReady) return;

      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => redisClient.del(k)));
      }
    } catch (err) {
      logger.warn(`Redis pattern invalidation error for ${pattern}:`, err);
    }
  }
}

// In-Memory Fallback Store for OTPs and short-lived tokens when Redis is offline
const inMemoryOtpStore = new Map<string, { value: string; expiresAt: number }>();

export class OtpStore {
  static async setEx(key: string, seconds: number, value: string): Promise<void> {
    try {
      if (redisClient.isOpen && redisClient.isReady) {
        await redisClient.setEx(key, seconds, value);
        return;
      }
    } catch (err) {
      logger.warn(`Redis setEx error for ${key}, using in-memory store:`, err);
    }
    inMemoryOtpStore.set(key, {
      value,
      expiresAt: Date.now() + seconds * 1000
    });
  }

  static async get(key: string): Promise<string | null> {
    try {
      if (redisClient.isOpen && redisClient.isReady) {
        const val = await redisClient.get(key);
        if (val !== null && val !== undefined) return String(val);
      }
    } catch (err) {
      logger.warn(`Redis get error for ${key}, using in-memory store:`, err);
    }

    const item = inMemoryOtpStore.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      inMemoryOtpStore.delete(key);
      return null;
    }

    return item.value;
  }

  static async del(key: string): Promise<void> {
    try {
      if (redisClient.isOpen && redisClient.isReady) {
        await redisClient.del(key);
      }
    } catch (err) {
      logger.warn(`Redis del error for ${key}, using in-memory store:`, err);
    }
    inMemoryOtpStore.delete(key);
  }
}
