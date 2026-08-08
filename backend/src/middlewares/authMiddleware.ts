import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError } from '../errors/AppError';
import { SessionRepository } from '../modules/auth/repositories/SessionRepository';

export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: TokenPayload;
  sessionId?: string;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;

    const sessionId = (req.headers['x-session-id'] || req.headers['x-session-token']) as string;
    if (sessionId) {
      req.sessionId = sessionId;
      const activeSession = await SessionRepository.findActiveSession(sessionId);
      if (!activeSession) {
        return next(new UnauthorizedError('Session has been revoked or expired'));
      }
      SessionRepository.updateLastUsed(sessionId).catch(() => null);
    }

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};
