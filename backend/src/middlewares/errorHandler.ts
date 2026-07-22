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
      message: 'Email already registered',
      data: null,
      errors: [(err as any).detail]
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

  logger.error('Unhandled Error', err);

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    data: null,
    errors: []
  });
};
