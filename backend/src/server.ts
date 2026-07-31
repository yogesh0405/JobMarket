import app from './app';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database/pool';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    const portNum = parseInt(String(env.PORT), 10) || 5000;
    app.listen(portNum, () => {
      console.log(`🚀 Server running on port ${portNum} in ${env.NODE_ENV} mode`);
      logger.info(`🚀 Server running on port ${portNum} in ${env.NODE_ENV} mode`);
    });

    // Verify DB & Redis asynchronously with unhandled rejection protection
    checkDatabaseConnection().catch(err => console.error('DB Conn Warning:', err));
    connectRedis().catch(err => console.warn('Redis Conn Warning:', err));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
