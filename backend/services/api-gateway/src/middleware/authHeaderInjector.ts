import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../../shared/config/env';

export const authHeaderInjector = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
      if (decoded && decoded.userId) {
        req.headers['x-user-id'] = decoded.userId;
        req.headers['x-user-role'] = decoded.role || 'candidate';
      }
    } catch {
      // Downstream microservices will handle unauthorized errors when auth is enforced
    }
  }
  next();
};
