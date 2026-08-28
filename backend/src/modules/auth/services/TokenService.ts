import bcrypt from 'bcrypt';
import { pool } from '../../../config/database/pool';
import { SessionRepository } from '../repositories/SessionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { generateTokens, verifyRefreshToken } from '../../../utils/jwt';
import { UnauthorizedError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';

export class TokenService {
  static async refresh(refreshTokenPlain: string, sessionId?: string, ipAddress?: string) {
    try {
      if (!refreshTokenPlain) {
        throw new UnauthorizedError('Refresh token is required');
      }

      const payload = verifyRefreshToken(refreshTokenPlain);
      if (!payload || !payload.userId) {
        throw new UnauthorizedError('Invalid refresh token payload');
      }
      
      let session = sessionId ? await SessionRepository.findActiveSession(sessionId) : null;
      if (!session && payload.sessionId) {
        session = await SessionRepository.findActiveSession(payload.sessionId);
      }
      if (!session && payload.userId) {
        const userSessions = await SessionRepository.findActiveUserSessions(payload.userId);
        session = userSessions[0] || null;
      }

      if (!session) {
        throw new UnauthorizedError('Session has expired or was revoked. Please log in again.');
      }

      // If refresh token hash is present, verify against the incoming token
      if (session.refresh_token_hash && session.refresh_token_hash !== 'temp_hash' && session.refresh_token_hash !== 'active_session') {
        const isValidHash = await bcrypt.compare(refreshTokenPlain, session.refresh_token_hash).catch(() => false);
        if (!isValidHash) {
          // Token reuse detected or token hash mismatch - revoke session for security
          await SessionRepository.revokeSession(session.id);
          logger.warn(`Potential token reuse detected on session ${session.id}. Session revoked.`);
          throw new UnauthorizedError('Invalid refresh token. Session has been revoked for security.');
        }
      }

      const user = await UserRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }
      
      const { accessToken, refreshToken: newRefreshToken } = generateTokens({
        userId: payload.userId,
        role: user.role || payload.role,
        sessionId: session.id
      });
      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

      // Update current active session with new rotated refresh token hash and extend expiration
      const updateQuery = `
        UPDATE sessions 
        SET refresh_token_hash = $1, revoked = FALSE, revoked_at = NULL, expires_at = NOW() + INTERVAL '7 days', last_used_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `;
      await pool.query(updateQuery, [newRefreshTokenHash, session.id]);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        sessionId: session.id
      };
    } catch (error: any) {
      logger.error('Refresh token failed:', error?.message || error);
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
