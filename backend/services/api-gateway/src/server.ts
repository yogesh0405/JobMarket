import app from './app';
import { env } from '../../../shared/config/env';
import { checkDatabaseConnection } from '../../../shared/database/pool';
import { connectRedis } from '../../../shared/config/redis';
import { logger } from '../../../shared/utils/logger';

const startServer = async () => {
  try {
    const portNum = parseInt(String(env.PORT), 10) || 5000;
    app.listen(portNum, () => {
      console.log(`🚀 API Gateway running on port ${portNum} in ${env.NODE_ENV} mode`);
      logger.info(`🚀 API Gateway running on port ${portNum} in ${env.NODE_ENV} mode`);
    });

    checkDatabaseConnection().catch(err => console.error('DB Conn Warning:', err));
    connectRedis().catch(err => console.warn('Redis Conn Warning:', err));
  } catch (error) {
    logger.error('Failed to start API Gateway server:', error);
    process.exit(1);
  }
};

startServer();
