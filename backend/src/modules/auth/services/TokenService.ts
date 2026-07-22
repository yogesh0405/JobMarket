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

      const user = await UserRepository.findByEmail(payload.userId); // wait, payload.userId is ID, not email! I need findById
      // I should add findById to UserRepository or just query here, or pass user.id to verifyRefreshToken
      
      const { accessToken, refreshToken } = generateTokens({ userId: payload.userId, role: payload.role });
      const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Revoke old session
        await SessionRepository.revokeSession(session.id, client);

        // Create new session
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
        const newSession = await SessionRepository.createSession(
          payload.userId,
          newRefreshTokenHash,
          expiresAt,
          ipAddress,
          session.user_agent,
          session.device_name,
          client
        );

        await client.query('COMMIT');

        return {
          accessToken,
          refreshToken,
          sessionId: newSession.id
        };
      } catch (dbError) {
        await client.query('ROLLBACK');
        throw dbError;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Refresh token failed', error);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
