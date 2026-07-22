import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { ForbiddenError } from '../errors/AppError';

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};
