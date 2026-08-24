import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../../shared/config/env';
import { SessionRepository } from '../../../../src/modules/auth/repositories/SessionRepository';

export const authHeaderInjector = async (req: Request, res: Response, next: NextFunction) => {
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
        // Real-time Revocation Verification
        if (decoded.sessionId) {
          const isRevoked = await SessionRepository.isSessionRevoked(String(decoded.sessionId));
          if (isRevoked) {
            // Terminated session -> Block immediately
            return res.status(401).json({
              success: false,
              error: 'SESSION_REVOKED',
              message: 'Your session has been terminated. Please log in again.',
            });
          }
          req.headers['x-session-id'] = String(decoded.sessionId);
        }

        req.headers['x-user-id'] = String(decoded.userId);
        req.headers['x-user-role'] = String(decoded.role || 'candidate');
      }
    } catch {
      // Token is invalid/expired -> identity headers remain stripped
    }
  }
  next();
};
