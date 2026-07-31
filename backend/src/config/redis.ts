import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 2000))
      ]);
    } catch (err) {
      console.warn('⚠️ Redis connection skipped/unavailable, continuing with in-memory caching fallback:', (err as Error).message);
    }
  }
};
