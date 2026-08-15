import bcrypt from 'bcrypt';
import { pool } from '../../../config/database/pool';
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { generateTokens } from '../../../utils/jwt';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';
import { sanitizeUserForResponse } from '../controllers/AuthController';
import { OtpStore } from '../../../utils/redisCache';
import { EmailService } from './EmailService';

export class LoginService {
  static async execute(email: string, passwordPlain: string, role?: string, ipAddress?: string, userAgent?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await UserRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Account is not verified. Please verify your OTP.');
    }

    if (role && user.role !== role) {
      throw new ForbiddenError('This user does not belong to this role, please change the role');
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isPasswordValid) {
      // Typically we'd log failed attempts to Redis here
      await AuditRepository.logAction('LOGIN_FAILED', user.id, 'Auth', ipAddress, userAgent);
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2FA Verification Check
    if (user.is_two_factor_enabled) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const mfaToken = `mfa_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const redisKey = `2fa:OTP:${mfaToken}`;

      await OtpStore.setEx(redisKey, 600, JSON.stringify({
        userId: user.id,
        email: user.email,
        otp: otpCode,
        attempts: 0
      }));

      console.log('\n=========================================\n🛡️ 2FA LOGIN VERIFICATION CODE FOR', user.email, ':', otpCode, '\n=========================================\n');

      await EmailService.send2FAOTP(user.email, otpCode, user.name);

      return {
        require2FA: true,
        mfaToken,
        email: user.email,
        message: 'Two-Factor Authentication (2FA) is enabled for your account. Please enter the 6-digit code sent to your email.'
      };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
      const session = await SessionRepository.createSession(
        user.id, 
        'temp_hash', 
        expiresAt, 
        ipAddress, 
        userAgent, 
        'Web',
        client
      );

      const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role, sessionId: session.id });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await client.query('UPDATE sessions SET refresh_token_hash = $1 WHERE id = $2', [refreshTokenHash, session.id]);

      await AuditRepository.logAction(
        'LOGIN_SUCCESS',
        user.id,
        'Auth',
        ipAddress,
        userAgent,
        { sessionId: session.id },
        client
      );

      await client.query('COMMIT');

      const fullUser = await UserRepository.findById(user.id);

      return {
        accessToken,
        refreshToken,
        sessionId: session.id,
        user: sanitizeUserForResponse(fullUser || user)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Login failed', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
