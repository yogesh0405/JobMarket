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

  // Errors with explicit statusCode (e.g. ServiceUnavailableError)
  if ((err as any).statusCode) {
    return res.status((err as any).statusCode).json({
      success: false,
      message: err.message,
      data: null,
      errors: []
    });
  }

  logger.error('Unhandled Error:', err);

  const status = (err as any).status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
    errors: [err.name || 'INTERNAL_ERROR']
  });
};
