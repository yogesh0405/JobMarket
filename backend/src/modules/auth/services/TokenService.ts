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
      const payload = verifyRefreshToken(refreshTokenPlain);
      
      let session = sessionId ? await SessionRepository.findActiveSession(sessionId) : null;
      if (!session && payload.sessionId) {
        session = await SessionRepository.findActiveSession(payload.sessionId);
      }
      if (!session && payload.userId) {
        const userSessions = await SessionRepository.findActiveUserSessions(payload.userId);
        session = userSessions[0] || null;
      }

      if (!session && payload.userId) {
        session = await SessionRepository.createSession(
          payload.userId,
          'temp_hash',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress || 'Mobile Client',
          'Mobile App',
          'Mobile Device'
        );
      }

      if (!session) {
        throw new UnauthorizedError('Session expired or invalid');
      }

      const user = await UserRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }
      
      const { accessToken, refreshToken } = generateTokens({ userId: payload.userId, role: payload.role, sessionId: session.id });
      const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);

      // Update current active session with new refresh token hash and extend expiration date by 7 days
      const updateQuery = `
        UPDATE sessions 
        SET refresh_token_hash = $1, revoked = FALSE, revoked_at = NULL, expires_at = NOW() + INTERVAL '7 days'
        WHERE id = $2;
      `;
      await pool.query(updateQuery, [newRefreshTokenHash, session.id]);

      return {
        accessToken,
        refreshToken,
        sessionId: session.id
      };
    } catch (error) {
      logger.error('Refresh token failed', error);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
