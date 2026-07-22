import bcrypt from 'bcrypt';
import { pool } from '../../../config/database/pool';
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { generateTokens } from '../../../utils/jwt';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';

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
        'LOGIN_SUCCESS',
        user.id,
        'Auth',
        ipAddress,
        userAgent,
        { sessionId: session.id },
        client
      );

      await client.query('COMMIT');

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
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
