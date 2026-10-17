import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { pool } from '../config/database/pool';

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
      errorCode: 'AUTH_REQUIRED',
      error: 'Authentication required. Please provide a valid authorization token.',
      message: 'Authentication required'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || (!decoded.id && !decoded.userId)) {
      return res.status(401).json({
        success: false,
        errorCode: 'INVALID_TOKEN',
        error: 'Invalid or expired authentication token.',
        message: 'Invalid token'
      });
    }

    const tokenSessionId = decoded.sessionId;
    const headerSessionId = (req.headers['x-session-id'] || req.headers['x-session-token']) as string;
    let sessionId = tokenSessionId;

    if (!sessionId && headerSessionId) {
      try {
        const { rows } = await pool.query(
          'SELECT id FROM sessions WHERE id = $1 AND user_id = $2 LIMIT 1',
          [headerSessionId, decoded.id || decoded.userId]
        );
        if (rows.length > 0) {
          sessionId = headerSessionId;
        }
      } catch (_) {}
    }

    if (sessionId) {
      const { SessionRepository } = await import('../modules/auth/repositories/SessionRepository');
      const isRevoked = await SessionRepository.isSessionRevoked(sessionId);
      if (isRevoked) {
        return res.status(401).json({
          success: false,
          errorCode: 'SESSION_REVOKED',
          error: 'Session has been revoked or expired. Please sign in again.',
          message: 'Session revoked'
        });
      }
      req.sessionId = sessionId;
    }

    // Live account status check — enforces suspension immediately even within token TTL
    const userId = decoded.id || decoded.userId;
    if (userId) {
      try {
        const { rows } = await pool.query('SELECT status FROM users WHERE id = $1 LIMIT 1', [userId]);
        if (rows.length > 0) {
          const status = rows[0].status;
          if (status === 'BLOCKED') {
            return res.status(403).json({
              success: false,
              errorCode: 'ACCOUNT_BLOCKED',
              error: 'Your account has been suspended by the platform administrator. Please contact support@jobmarket.com for assistance.',
              message: 'Your account has been suspended by the platform administrator. Please contact support@jobmarket.com for assistance.'
            });
          }
          if (status === 'INACTIVE') {
            return res.status(403).json({
              success: false,
              errorCode: 'ACCOUNT_INACTIVE',
              error: 'Your account is currently inactive. Please verify your email to continue.',
              message: 'Your account is currently inactive. Please verify your email to continue.'
            });
          }
        }
      } catch (_) {
        // Non-blocking — do not fail request if status check fails
      }
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
      errorCode: 'TOKEN_EXPIRED',
      error: 'Invalid or expired access token. Please sign in again.',
      message: 'Token expired or invalid'
    });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    if (decoded && (decoded.id || decoded.userId)) {
      req.user = {
        ...decoded,
        id: decoded.id || decoded.userId,
        userId: decoded.userId || decoded.id || ''
      };
    }
  } catch (_) {
    // Non-blocking: continue as guest if token is expired or invalid
  }

  return next();
};

