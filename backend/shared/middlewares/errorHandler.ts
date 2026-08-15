import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      errors: err.code ? [err.code] : []
    });
  }

  // Postgres unique violation
  if ((err as any).code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Resource or record already exists',
      data: null,
      errors: ['DUPLICATE_ENTRY']
    });
  }

  if ((err as any).statusCode) {
    return res.status((err as any).statusCode).json({
      success: false,
      message: err.message,
      data: null,
      errors: []
    });
  }

  logger.error('Unhandled Error:', err);

  const isProd = process.env.NODE_ENV === 'production';
  const status = (err as any).status || 500;
  const message = isProd ? 'An unexpected server error occurred. Please try again later.' : (err.message || 'Internal Server Error');

  return res.status(status).json({
    success: false,
    message,
    data: null,
    errors: [err.name || 'INTERNAL_ERROR']
  });
};
