import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      // Reconnect gracefully with exponential backoff up to 3s
      return Math.min(retries * 500, 3000);
    },
    connectTimeout: 5000,
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

