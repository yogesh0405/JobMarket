import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { SignupService } from '../services/SignupService';
import { VerifyOTPService } from '../services/VerifyOTPService';
import { LoginService } from '../services/LoginService';
import { TokenService } from '../services/TokenService';
import { LogoutService } from '../services/LogoutService';
import { UpdateProfileService } from '../services/UpdateProfileService';
import { EmailService } from '../services/EmailService';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { pool } from '../../../config/database/pool';
import { redisClient } from '../../../config/redis';
import { CloudinaryUtil } from '../../../utils/cloudinary';

export function sanitizeUserForResponse(user: any) {
  if (!user) return user;
  const { password_hash, ...safeUser } = user;
  if (safeUser.resume) {
    const { url, ...resumeWithoutUrl } = safeUser.resume;
    safeUser.resume = resumeWithoutUrl;
  }
  return safeUser;
}

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];
      const result = await SignupService.execute(req.body, ip, userAgent);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email: result.email
        },
        errors: null
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const result = await VerifyOTPService.execute(email, otpCode, ip, userAgent);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await LoginService.execute(email, password, role, ip, userAgent);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken, sessionId } = req.body;
      const ip = req.ip;

      const result = await TokenService.refresh(refreshToken, sessionId, ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body; // Assuming client sends sessionId they want to logout from
      const userId = req.user!.userId;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      await LogoutService.execute(sessionId, userId, ip, userAgent);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentSessionId } = req.body; // Optional
      const userId = req.user!.userId;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      await LogoutService.logoutAll(userId, currentSessionId, ip, userAgent);
      res.status(200).json({ success: true, message: 'Logged out from all devices successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await UserRepository.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ success: true, data: sanitizeUserForResponse(user) });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profileData = req.body;
      
      const result = await UpdateProfileService.execute(userId, profileData);
      res.status(200).json({ success: true, data: sanitizeUserForResponse(result) });
    } catch (error) {
      next(error);
    }
  }

  static async getResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user!.userId;
      const currentUserRole = req.user!.role;
      
      let targetUserId = currentUserId;
      if ((currentUserRole === 'employer' || currentUserRole === 'admin') && req.query.userId) {
        targetUserId = req.query.userId as string;
      }

      const user = await UserRepository.findById(targetUserId);
      if (!user || !user.resume || !user.resume.url) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      res.status(200).json({ success: true, url: user.resume.url });
    } catch (error) {
      next(error);
    }
  }

  static async uploadProfilePicture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      if (!image.startsWith('data:image/webp;base64,')) {
        return res.status(400).json({ error: 'Only WebP images are supported for profile pictures' });
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.profile_picture_url) {
        const oldPublicId = CloudinaryUtil.extractPublicId(user.profile_picture_url);
        if (oldPublicId) {
          try {
            await CloudinaryUtil.deleteImage(oldPublicId);
          } catch (err) {
            console.error('Failed to delete old profile image from Cloudinary:', err);
          }
        }
      }

      const publicId = `user_${userId}_${Date.now()}`;
      const secureUrl = await CloudinaryUtil.uploadImage(image, 'profiles', publicId);

      const updatedUser = await UserRepository.updateProfile(userId, { profile_picture_url: secureUrl });

      res.status(200).json({
        success: true,
        data: sanitizeUserForResponse(updatedUser)
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfilePicture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await UserRepository.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.profile_picture_url) {
        const publicId = CloudinaryUtil.extractPublicId(user.profile_picture_url);
        if (publicId) {
          await CloudinaryUtil.deleteImage(publicId);
        }
      }

      const updatedUser = await UserRepository.updateProfile(userId, { profile_picture_url: null } as any);

      res.status(200).json({
        success: true,
        data: sanitizeUserForResponse(updatedUser)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * SECURITY FEATURES
   */

  // 1. Get active login sessions
  static async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const rawSessions = await SessionRepository.findActiveUserSessions(userId);

      const sessions = rawSessions.map(s => {
        const ua = s.user_agent || '';
        let browser = 'Unknown Browser';
        let os = 'Unknown OS';
        let deviceType = 'Desktop';

        if (/chrome/i.test(ua)) browser = 'Chrome';
        else if (/firefox/i.test(ua)) browser = 'Firefox';
        else if (/safari/i.test(ua)) browser = 'Safari';
        else if (/edge/i.test(ua)) browser = 'Edge';

        if (/android/i.test(ua)) { os = 'Android'; deviceType = 'Mobile'; }
        else if (/iphone|ipad|ipod/i.test(ua)) { os = 'iOS'; deviceType = 'Mobile'; }
        else if (/macintosh|mac os x/i.test(ua)) { os = 'macOS'; }
        else if (/windows/i.test(ua)) { os = 'Windows'; }
        else if (/linux/i.test(ua)) { os = 'Linux'; }

        return {
          id: s.id,
          ipAddress: s.ip_address || '127.0.0.1',
          deviceName: s.device_name || `${os} (${browser})`,
          browser,
          os,
          deviceType,
          createdAt: s.created_at,
          lastUsedAt: s.last_used_at,
        };
      });

      res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  // 2. Revoke a specific session
  static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.sessionId as string;
      await SessionRepository.revokeSession(sessionId);
      res.status(200).json({ success: true, message: 'Session revoked successfully' });
    } catch (error) {
      next(error);
    }
  }

  // 3. Change password (for logged-in user)
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);

      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async recordProfileView(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ success: true, message: 'View recorded' });
    } catch (error) {
      next(error);
    }
  }

  // 4. Forgot password - Request Email OTP
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await UserRepository.findByEmail(normalizedEmail);

      // Always return positive message to avoid user enumeration
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If an account exists with this email, a 6-digit OTP verification code has been sent.'
        });
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const redisKey = `reset:OTP:${normalizedEmail}`;

      // Store in Redis with 10-minute expiry
      await redisClient.setEx(redisKey, 600, JSON.stringify({ otp: otpCode, attempts: 0 }));

      // Send Email
      await EmailService.sendPasswordResetOTP(normalizedEmail, otpCode, user.name);

      res.status(200).json({
        success: true,
        message: 'A 6-digit OTP verification code has been sent to your email.'
      });
    } catch (error) {
      next(error);
    }
  }

  // 5. Verify Reset OTP Code
  static async verifyResetOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;
      if (!email || !otpCode) {
        return res.status(400).json({ error: 'Email and OTP code are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const redisKey = `reset:OTP:${normalizedEmail}`;

      const payloadStr = await redisClient.get(redisKey);
      if (!payloadStr) {
        return res.status(400).json({ error: 'OTP has expired or is invalid. Please request a new OTP.' });
      }

      const payload = JSON.parse(payloadStr);

      if (payload.attempts >= 5) {
        await redisClient.del(redisKey);
        return res.status(400).json({ error: 'Maximum OTP attempts reached. Please request a new OTP.' });
      }

      if (payload.otp !== otpCode.trim()) {
        payload.attempts += 1;
        await redisClient.setEx(redisKey, 600, JSON.stringify(payload));
        return res.status(400).json({ error: 'Invalid 6-digit OTP code' });
      }

      // Set Verified Key for 15 minutes
      const verifiedKey = `reset:VERIFIED:${normalizedEmail}`;
      await redisClient.setEx(verifiedKey, 900, 'VERIFIED');

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully. You can now set a new password.'
      });
    } catch (error) {
      next(error);
    }
  }

  // 6. Reset Password with Verified OTP
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode, newPassword } = req.body;
      if (!email || !otpCode || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const redisKey = `reset:OTP:${normalizedEmail}`;
      const payloadStr = await redisClient.get(redisKey);

      if (!payloadStr) {
        return res.status(400).json({ error: 'OTP verification session expired. Please start over.' });
      }

      const payload = JSON.parse(payloadStr);
      if (payload.otp !== otpCode.trim()) {
        return res.status(400).json({ error: 'Invalid OTP code' });
      }

      const user = await UserRepository.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({ error: 'User account not found' });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, user.id]);

      // Revoke old active sessions
      await SessionRepository.revokeAllUserSessions(user.id);

      // Clean Redis
      await redisClient.del(redisKey);
      await redisClient.del(`reset:VERIFIED:${normalizedEmail}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }
}

