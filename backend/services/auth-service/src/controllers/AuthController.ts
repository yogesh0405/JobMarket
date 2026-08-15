import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SignupService } from '../../../../src/modules/auth/services/SignupService';
import { VerifyOTPService } from '../../../../src/modules/auth/services/VerifyOTPService';
import { LoginService } from '../../../../src/modules/auth/services/LoginService';
import { TokenService } from '../../../../src/modules/auth/services/TokenService';
import { LogoutService } from '../../../../src/modules/auth/services/LogoutService';
import { EmailService } from '../../../../src/modules/auth/services/EmailService';
import { Verify2FALoginService } from '../../../../src/modules/auth/services/Verify2FALoginService';
import { UserRepository } from '../../../../src/modules/auth/repositories/UserRepository';
import { SessionRepository } from '../../../../src/modules/auth/repositories/SessionRepository';
import { pool } from '../../../../shared/database/pool';
import { OtpStore, CacheService } from '../../../../shared/utils/redisCache';
import { generateTokens } from '../../../../shared/utils/jwt';
import { AuthenticatedRequest } from '../../../../shared/types';

export function sanitizeUserForResponse(user: any) {
  if (!user) return user;
  const { password_hash, two_factor_secret, reset_token, refresh_token_hash, ...safeUser } = user;
  return safeUser;
}

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SignupService.execute(req.body, req.ip, req.headers['user-agent']);
      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email },
        errors: null
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;
      const result = await VerifyOTPService.execute(email, otpCode, req.ip, req.headers['user-agent']);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user ? sanitizeUserForResponse(result.user) : null,
        tokens: result.tokens
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await LoginService.execute(email, password, req.ip, req.headers['user-agent']);
      if (result.requires2FA) {
        return res.status(200).json({
          success: true,
          message: result.message,
          requires2FA: true,
          mfaToken: result.mfaToken
        });
      }
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: sanitizeUserForResponse(result.user),
        tokens: result.tokens
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await TokenService.refresh(refreshToken, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, tokens });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    return AuthController.refreshToken(req, res, next);
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const sessionId = req.headers['x-session-id'] as string || req.sessionId;
      if (sessionId) {
        await LogoutService.execute(sessionId);
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const currentSessionId = req.headers['x-session-id'] as string || req.sessionId;
      if (userId) {
        await SessionRepository.revokeAllUserSessions(userId, currentSessionId);
      }
      res.status(200).json({ success: true, message: 'Logged out from all devices successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await UserRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.status(200).json({ success: true, data: sanitizeUserForResponse(user) });
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const sessions = await SessionRepository.findActiveByUserId(userId);
      res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { sessionId } = req.params;
      if (!userId || !sessionId) return res.status(400).json({ error: 'Bad Request' });

      await SessionRepository.revoke(sessionId);
      res.status(200).json({ success: true, message: 'Session revoked successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { currentPassword, newPassword } = req.body;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await UserRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email address is required' });
      const normalizedEmail = email.toLowerCase().trim();
      const user = await UserRepository.findByEmail(normalizedEmail);
      if (!user) return res.status(404).json({ error: 'No account found with this email address.' });

      const otpCode = crypto.randomInt(100000, 1000000).toString();
      const redisKey = `reset:OTP:${normalizedEmail}`;
      await OtpStore.setEx(redisKey, 600, JSON.stringify({ otp: otpCode, attempts: 0 }));

      await EmailService.sendPasswordResetOTP(normalizedEmail, otpCode, user.name);
      res.status(200).json({ success: true, message: 'A 6-digit OTP verification code has been sent to your registered email address.' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyResetOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;
      if (!email || !otpCode) return res.status(400).json({ error: 'Email and OTP code are required' });
      const normalizedEmail = email.toLowerCase().trim();
      const redisKey = `reset:OTP:${normalizedEmail}`;
      const payloadStr = await OtpStore.get(redisKey);
      if (!payloadStr) return res.status(400).json({ error: 'OTP has expired or is invalid.' });

      const payload = JSON.parse(String(payloadStr));
      if (payload.attempts >= 5) {
        await OtpStore.del(redisKey);
        return res.status(400).json({ error: 'Maximum OTP attempts reached.' });
      }
      if (payload.otp !== otpCode.trim()) {
        payload.attempts += 1;
        await OtpStore.setEx(redisKey, 600, JSON.stringify(payload));
        return res.status(400).json({ error: 'Invalid 6-digit OTP code' });
      }

      await OtpStore.setEx(`reset:VERIFIED:${normalizedEmail}`, 900, 'VERIFIED');
      res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode, newPassword } = req.body;
      if (!email || !otpCode || !newPassword) return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters long' });

      const normalizedEmail = email.toLowerCase().trim();
      const redisKey = `reset:OTP:${normalizedEmail}`;
      const payloadStr = await OtpStore.get(redisKey);
      if (!payloadStr) return res.status(400).json({ error: 'OTP verification session expired.' });

      const payload = JSON.parse(String(payloadStr));
      if (payload.otp !== otpCode.trim()) return res.status(400).json({ error: 'Invalid OTP code' });

      const user = await UserRepository.findByEmail(normalizedEmail);
      if (!user) return res.status(404).json({ error: 'User account not found' });

      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, user.id]);
      await SessionRepository.revokeAllUserSessions(user.id);
      await OtpStore.del(redisKey);
      await OtpStore.del(`reset:VERIFIED:${normalizedEmail}`);

      res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async verify2FALogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { mfaToken, otpCode } = req.body;
      const result = await Verify2FALoginService.execute(mfaToken, otpCode, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async toggle2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { enabled } = req.body;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      await pool.query('UPDATE users SET is_two_factor_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [Boolean(enabled), userId]);
      await CacheService.invalidate(`user:profile:${userId}`);

      res.status(200).json({
        success: true,
        isTwoFactorEnabled: Boolean(enabled),
        message: enabled ? '2FA protection enabled successfully.' : '2FA protection disabled.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, picture, role = 'candidate', googleId } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Google Auth requires valid email address' });

      let user = await UserRepository.findByEmail(email);
      if (!user) {
        const dummyPassword = await bcrypt.hash(`google_${googleId || Date.now()}_${Math.random()}`, 12);
        user = await UserRepository.createUser({
          email: email.toLowerCase().trim(),
          name: name || email.split('@')[0],
          password_hash: dummyPassword,
          role: role || 'candidate',
          status: 'ACTIVE',
          profile_picture_url: picture || null,
        } as any);
      }

      const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const session = await SessionRepository.createSession(user.id, refreshTokenHash, expiresAt, req.ip || '127.0.0.1', (req.headers['user-agent'] as string) || 'Google OAuth Device');

      res.status(200).json({
        success: true,
        message: 'Google Sign-In successful!',
        data: {
          user: sanitizeUserForResponse(user),
          token: accessToken,
          refreshToken,
          sessionId: session?.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
