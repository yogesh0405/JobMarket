import app from './app';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database/pool';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Check connections before starting server
    await checkDatabaseConnection();
    await connectRedis();

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
