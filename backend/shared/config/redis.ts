import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      return Math.min(retries * 500, 3000);
    },
    connectTimeout: 5000,
  },
});

let hasLoggedOfflineWarning = false;

redisClient.on('error', (err: any) => {
  if (err?.code === 'ECONNREFUSED' || err?.message?.includes('ECONNREFUSED') || !redisClient.isOpen) {
    if (!hasLoggedOfflineWarning) {
      console.warn('⚠️ Shared Redis client offline or unreachable. Using fallback logic.');
      hasLoggedOfflineWarning = true;
    }
    return;
  }
  console.warn('⚠️ Redis warning:', err?.message || err);
});

redisClient.on('connect', () => {
  hasLoggedOfflineWarning = false;
  console.log('✅ Shared Redis client connected successfully');
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch {
      // Error handled cleanly by redisClient listener
    }
  }
};
