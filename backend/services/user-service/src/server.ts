import app from './app';
import { env } from '../../../shared/config/env';
import { checkDatabaseConnection } from '../../../shared/database/pool';
import { connectRedis } from '../../../shared/config/redis';
import { logger } from '../../../shared/utils/logger';

const startServer = async () => {
  try {
    const port = env.USER_SERVICE_PORT || 5002;
    app.listen(port, () => {
      console.log(`👤 User Profile Microservice running on port ${port}`);
      logger.info(`👤 User Profile Microservice running on port ${port}`);
    });

    checkDatabaseConnection().catch(() => null);
    connectRedis().catch(() => null);
  } catch (error) {
    logger.error('Failed to start User Profile Microservice:', error);
    process.exit(1);
  }
};

startServer();
