import bcrypt from 'bcrypt';
import { pool } from '../../../config/database/pool';
import { OtpStore } from '../../../utils/redisCache';
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { generateTokens } from '../../../utils/jwt';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';

export class VerifyOTPService {
  static async execute(email: string, otpCode: string, ipAddress?: string, userAgent?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const redisKey = `registration:OTP:${normalizedEmail}`;

    const payloadStr = await OtpStore.get(redisKey);
    if (!payloadStr) {
      throw new BadRequestError('OTP has expired or is invalid. Please sign up again.');
    }

    const payload = JSON.parse(String(payloadStr));

    if (payload.attempts >= 3) {
      await OtpStore.del(redisKey);
      throw new BadRequestError('Maximum OTP attempts reached. Please sign up again.');
    }

    if (payload.otp !== otpCode) {
      payload.attempts += 1;
      await OtpStore.setEx(redisKey, 600, JSON.stringify(payload));
      throw new BadRequestError('Invalid OTP code');
    }

    // OTP Verified, proceed to save user in PostgreSQL
    const { userData } = payload;
    const aadhaarVerified = !!(userData.aadhaarNumber && /^\d{12}$/.test(userData.aadhaarNumber));
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const newUser = await UserRepository.createUser({
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        company_name: userData.companyName,
        gst_number: userData.gstNumber,
        aadhaar_verified: aadhaarVerified,
        trade_specialization: userData.tradeSpecialization,
        status: 'ACTIVE' // Insert as ACTIVE directly
      }, client);

      // Generate Tokens
      const { accessToken, refreshToken } = generateTokens({ userId: newUser.id, role: newUser.role });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      // Create Session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
      const session = await SessionRepository.createSession(
        newUser.id, 
        refreshTokenHash, 
        expiresAt, 
        ipAddress || payload.ipAddress, 
        userAgent || payload.userAgent, 
        'Web',
        client
      );

      await AuditRepository.logAction(
        'USER_REGISTERED_AND_VERIFIED',
        newUser.id,
        'Auth',
        ipAddress || payload.ipAddress,
        userAgent || payload.userAgent,
        { sessionId: session.id },
        client
      );

      await client.query('COMMIT');
      
      // Clean up OtpStore
      await OtpStore.del(redisKey);

      return {
        message: 'Account verified and created successfully.',
        accessToken,
        refreshToken,
        sessionId: session.id,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create user after OTP verification', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
