import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'development' ? colorize() : winston.format.uncolorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});
