import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from './EmailService';
import { ConflictError, BadRequestError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';
import { OtpStore } from '../../../utils/redisCache';

class ServiceUnavailableError extends Error {
  public statusCode = 503;
  constructor(message: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export class SignupService {
  static async execute(userData: any, ipAddress?: string, userAgent?: string): Promise<{
    message: string;
    email: string;
  }> {
    const { email, password, name, role, phone, companyName, gstNumber, aadhaarNumber, tradeSpecialization } = userData;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Generate real OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store registration data in OtpStore (Expires in 10 minutes)
    const redisKey = `registration:OTP:${normalizedEmail}`;
    const payload = {
      userData: {
        email: normalizedEmail,
        password,
        name,
        role,
        phone: phone || null,
        companyName: companyName || null,
        gstNumber: gstNumber || null,
        aadhaarNumber: aadhaarNumber || null,
        tradeSpecialization: tradeSpecialization || null,
      },
      otp,
      attempts: 0,
      ipAddress,
      userAgent
    };

    await OtpStore.setEx(redisKey, 600, JSON.stringify(payload));

    // Send OTP via Brevo API
    const emailSent = await EmailService.sendOTP(normalizedEmail, otp, name);

    if (!emailSent) {
      // Clean up OtpStore so user can retry
      await OtpStore.del(redisKey);
      throw new ServiceUnavailableError('Email service is temporarily unavailable. Please try again in a few minutes.');
    }

    logger.info(`Registration initiated for ${normalizedEmail}. OTP sent via Brevo.`);

    return {
      message: 'OTP sent successfully. Please check your email.',
      email: normalizedEmail,
    };
  }
}
