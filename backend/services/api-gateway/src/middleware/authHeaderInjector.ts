import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../../shared/config/env';

export const authHeaderInjector = (req: Request, res: Response, next: NextFunction) => {
  // CRITICAL SECURITY HARDENING: Always strip client-supplied header overrides
  delete req.headers['x-user-id'];
  delete req.headers['x-user-role'];
  delete req.headers['x-session-id'];

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
      if (decoded && decoded.userId) {
        req.headers['x-user-id'] = String(decoded.userId);
        req.headers['x-user-role'] = String(decoded.role || 'candidate');
        if (decoded.sessionId) {
          req.headers['x-session-id'] = String(decoded.sessionId);
        }
      }
    } catch {
      // Token is invalid/expired -> identity headers remain stripped
    }
  }
  next();
};
