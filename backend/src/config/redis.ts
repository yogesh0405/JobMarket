import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      // Stop retrying after 2 attempts if Redis is not running locally to prevent console spam
      if (retries >= 2) {
        return false;
      }
      return 500;
    },
    connectTimeout: 2000,
  },
});

let hasLoggedOfflineWarning = false;

redisClient.on('error', (err: any) => {
  if (err?.code === 'ECONNREFUSED' || err?.message?.includes('ECONNREFUSED') || !redisClient.isOpen) {
    if (!hasLoggedOfflineWarning) {
      console.warn('⚠️ Redis is offline or unreachable. Operating with in-memory fallback.');
      hasLoggedOfflineWarning = true;
    }
    return;
  }
  console.warn('⚠️ Redis warning:', err?.message || err);
});

redisClient.on('connect', () => {
  hasLoggedOfflineWarning = false;
  console.log('✅ Redis connected successfully');
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch {
      // Error handled cleanly by redisClient.on('error') listener
    }
  }
};

