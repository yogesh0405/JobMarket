import bcrypt from 'bcrypt';
import { pool } from '../../../config/database/pool';
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { generateTokens } from '../../../utils/jwt';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';
import { sanitizeUserForResponse } from '../controllers/AuthController';
import { OtpStore } from '../../../utils/redisCache';

export class Verify2FALoginService {
  static async execute(mfaToken: string, otpCode: string, ipAddress?: string, userAgent?: string) {
    if (!mfaToken || !otpCode) {
      throw new BadRequestError('MFA token and 2FA OTP code are required');
    }

    const redisKey = `2fa:OTP:${mfaToken.trim()}`;
    const payloadStr = await OtpStore.get(redisKey);

    if (!payloadStr) {
      throw new BadRequestError('2FA session has expired or is invalid. Please log in again.');
    }

    const payload = JSON.parse(String(payloadStr));

    if (payload.attempts >= 5) {
      await OtpStore.del(redisKey);
      throw new BadRequestError('Maximum 2FA verification attempts reached. Please log in again.');
    }

    if (payload.otp !== otpCode.trim()) {
      payload.attempts += 1;
      await OtpStore.setEx(redisKey, 600, JSON.stringify(payload));
      throw new BadRequestError('Invalid 6-digit 2FA security code');
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
      const session = await SessionRepository.createSession(
        user.id, 
        refreshTokenHash, 
        expiresAt, 
        ipAddress, 
        userAgent, 
        'Web',
        client
      );

      await AuditRepository.logAction(
        'LOGIN_SUCCESS_2FA',
        user.id,
        'Auth',
        ipAddress,
        userAgent,
        { sessionId: session.id },
        client
      );

      await client.query('COMMIT');

      // Clean up OtpStore
      await OtpStore.del(redisKey);

      return {
        accessToken,
        refreshToken,
        sessionId: session.id,
        user: sanitizeUserForResponse(user)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('2FA Login verification failed', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
