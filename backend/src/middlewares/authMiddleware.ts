import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: TokenPayload;
  sessionId?: string;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid authorization token.',
      message: 'Authentication required'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || (!decoded.id && !decoded.userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token.',
        message: 'Invalid token'
      });
    }

    const sessionId = (decoded.sessionId || req.headers['x-session-id'] || req.headers['x-session-token']) as string;
    if (sessionId) {
      const { SessionRepository } = await import('../modules/auth/repositories/SessionRepository');
      const isRevoked = await SessionRepository.isSessionRevoked(sessionId);
      if (isRevoked) {
        return res.status(401).json({
          success: false,
          error: 'Session has been revoked or expired. Please sign in again.',
          message: 'Session revoked'
        });
      }
      req.sessionId = sessionId;
    }

    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId,
      userId: decoded.userId || decoded.id || ''
    };

    return next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired access token. Please sign in again.',
      message: 'Token expired or invalid'
    });
  }
};
