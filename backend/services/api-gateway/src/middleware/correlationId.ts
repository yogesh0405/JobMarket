import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const existingId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
  const correlationId = (Array.isArray(existingId) ? existingId[0] : existingId) || randomUUID();

  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  (req as any).correlationId = correlationId;
  next();
};
