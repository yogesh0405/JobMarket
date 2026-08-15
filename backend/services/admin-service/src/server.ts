import app from './app';
import { env } from '../../../shared/config/env';
import { checkDatabaseConnection } from '../../../shared/database/pool';
import { connectRedis } from '../../../shared/config/redis';
import { logger } from '../../../shared/utils/logger';

const startServer = async () => {
  try {
    const port = env.ADMIN_SERVICE_PORT || 5008;
    app.listen(port, () => {
      console.log(`🛡️ Admin Microservice running on port ${port}`);
      logger.info(`🛡️ Admin Microservice running on port ${port}`);
    });

    checkDatabaseConnection().catch(() => null);
    connectRedis().catch(() => null);
  } catch (error) {
    logger.error('Failed to start Admin Microservice:', error);
    process.exit(1);
  }
};

startServer();
