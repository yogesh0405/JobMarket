import app from './app';
import { env } from '../../../shared/config/env';
import { checkDatabaseConnection } from '../../../shared/database/pool';
import { connectRedis } from '../../../shared/config/redis';
import { logger } from '../../../shared/utils/logger';

const startServer = async () => {
  try {
    const port = env.AD_SERVICE_PORT || 5007;
    app.listen(port, () => {
      console.log(`📢 Advertisement Microservice running on port ${port}`);
      logger.info(`📢 Advertisement Microservice running on port ${port}`);
    });

    checkDatabaseConnection().catch(() => null);
    connectRedis().catch(() => null);
  } catch (error) {
    logger.error('Failed to start Advertisement Microservice:', error);
    process.exit(1);
  }
};

startServer();
