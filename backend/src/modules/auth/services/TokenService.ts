import bcrypt from 'bcrypt';
import { pool } from '../../../config/database/pool';
import { SessionRepository } from '../repositories/SessionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { generateTokens, verifyRefreshToken } from '../../../utils/jwt';
import { UnauthorizedError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';

export class TokenService {
  static async refresh(refreshTokenPlain: string, sessionId: string, ipAddress?: string) {
    try {
      const payload = verifyRefreshToken(refreshTokenPlain);
      
      const session = await SessionRepository.findActiveSession(sessionId);
      if (!session) {
        throw new UnauthorizedError('Session expired or invalid');
      }

      const isTokenMatch = await bcrypt.compare(refreshTokenPlain, session.refresh_token_hash);
      if (!isTokenMatch) {
        // Suspected token theft, invalidate all sessions
        await SessionRepository.revokeAllUserSessions(payload.userId);
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await UserRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }
      
      const { accessToken, refreshToken } = generateTokens({ userId: payload.userId, role: payload.role });
      const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);

      // Update current active session with new refresh token hash and extend expiration date by 7 days
      const updateQuery = `
        UPDATE sessions 
        SET refresh_token_hash = $1, expires_at = NOW() + INTERVAL '7 days'
        WHERE id = $2 AND revoked = FALSE;
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
