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
import { OtpStore, CacheService } from '../../../utils/redisCache';
import { Verify2FALoginService } from '../services/Verify2FALoginService';
import { CloudinaryUtil } from '../../../utils/cloudinary';

export function sanitizeUserForResponse(user: any) {
  if (!user) return user;
  const { password_hash, ...safeUser } = user;
  
  if (safeUser.resume) {
    if (typeof safeUser.resume === 'string') {
      try { safeUser.resume = JSON.parse(safeUser.resume); } catch (_) {}
    }
    if (typeof safeUser.resume !== 'object' || !safeUser.resume || Object.keys(safeUser.resume).length === 0) {
      safeUser.resume = null;
    } else {
      const resumeObj = safeUser.resume;
      safeUser.resume = (resumeObj.url || resumeObj.name || resumeObj.size) ? resumeObj : null;
    }
  } else {
    safeUser.resume = null;
  }

  if (safeUser.experience) {
    if (typeof safeUser.experience === 'string') {
      try { safeUser.experience = JSON.parse(safeUser.experience); } catch (_) { safeUser.experience = []; }
    }
    if (!Array.isArray(safeUser.experience)) {
      safeUser.experience = [];
    }
  } else {
    safeUser.experience = [];
  }

  if (safeUser.education) {
    if (typeof safeUser.education === 'string') {
      try { safeUser.education = JSON.parse(safeUser.education); } catch (_) { safeUser.education = []; }
    }
    if (!Array.isArray(safeUser.education)) {
      safeUser.education = [];
    }
  } else {
    safeUser.education = [];
  }

  if (safeUser.skills) {
    if (typeof safeUser.skills === 'string') {
      try { safeUser.skills = JSON.parse(safeUser.skills); } catch (_) { safeUser.skills = safeUser.skills.split(',').map((s: string) => s.trim()).filter(Boolean); }
    }
    if (!Array.isArray(safeUser.skills)) {
      safeUser.skills = [];
    }
  } else {
    safeUser.skills = [];
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

  static async deleteResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await UserRepository.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.resume && user.resume.url) {
        const publicId = CloudinaryUtil.extractPublicId(user.resume.url);
        if (publicId) {
          try {
            await CloudinaryUtil.deleteFile(publicId);
          } catch (err) {
            console.error('Failed to delete resume file from Cloudinary:', err);
          }
        }
      }

      const updatedUser = await UserRepository.updateProfile(userId, { resume: null });
      res.status(200).json({
        success: true,
        data: sanitizeUserForResponse(updatedUser)
      });
    } catch (error) {
      next(error);
    }
  }

  static async getResumeSignature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const resourceType = (req.query.resourceType as string) || 'auto';
      const publicId = `resume_${userId}_${Date.now()}`;
      const sigData = CloudinaryUtil.getUploadSignature('resumes', publicId);
      res.status(200).json({ success: true, data: { ...sigData, resourceType } });
    } catch (error) {
      next(error);
    }
  }

  static async uploadResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { name, fileName, size, type, url, base64, file } = req.body;

      const base64Data = base64 || file;
      const fileTitle = fileName || name || 'Resume_BioData.jpg';

      let finalUrl = url;
      if (!finalUrl && base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const publicId = `resume_${userId}_${Date.now()}`;
        const isPdf = (type && type.includes('pdf')) || (fileTitle && fileTitle.toLowerCase().endsWith('.pdf'));
        finalUrl = isPdf
          ? await CloudinaryUtil.uploadFile(base64Data, 'resumes', publicId)
          : await CloudinaryUtil.uploadImage(base64Data, 'resumes', publicId);
      }

      if (!finalUrl) {
        return res.status(400).json({ error: 'Resume URL or file data is required' });
      }

      const currentUser = await UserRepository.findById(userId);
      if (currentUser?.resume?.url && currentUser.resume.url !== finalUrl) {
        const oldPublicId = CloudinaryUtil.extractPublicId(currentUser.resume.url);
        if (oldPublicId) {
          try {
            await CloudinaryUtil.deleteFile(oldPublicId);
          } catch (err) {
            console.error('Failed to delete old resume file:', err);
          }
        }
      }

      const resumeData = {
        name: fileTitle,
        size: size || '1.0 MB',
        type: type || (fileTitle.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        uploadedAt: new Date().toISOString(),
        url: finalUrl
      };

      const updatedUser = await UserRepository.updateProfile(userId, { resume: resumeData });
      res.status(200).json({
        success: true,
        url: finalUrl,
        data: sanitizeUserForResponse(updatedUser)
      });
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
      const currentSessionId = req.sessionId || (req.headers['x-session-id'] as string);
      const rawSessions = await SessionRepository.findActiveUserSessions(userId);

      const sessions = rawSessions.map(s => {
        const ua = s.user_agent || '';
        let browser = 'Chrome';
        let os = 'macOS';
        let deviceType = 'Desktop';

        // 1. Detect Browser
        if (/edg|edge/i.test(ua)) browser = 'Edge';
        else if (/opera|opr/i.test(ua)) browser = 'Opera';
        else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
        else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
        else if (/safari/i.test(ua)) browser = 'Safari';

        // 2. Detect OS & Device Type
        if (/android/i.test(ua)) {
          os = 'Android';
          deviceType = 'Mobile';
        } else if (/ipad/i.test(ua)) {
          os = 'iPadOS';
          deviceType = 'Tablet';
        } else if (/iphone|ipod/i.test(ua)) {
          os = 'iOS';
          deviceType = 'Mobile';
        } else if (/macintosh|mac os x/i.test(ua)) {
          os = 'macOS';
          deviceType = 'Desktop';
        } else if (/windows/i.test(ua)) {
          os = 'Windows';
          deviceType = 'Desktop';
        } else if (/linux/i.test(ua)) {
          os = 'Linux';
          deviceType = 'Desktop';
        }

        let cleanIp = s.ip_address || '127.0.0.1';
        if (cleanIp === '::1' || cleanIp === '::ffff:127.0.0.1') {
          cleanIp = '127.0.0.1 (Current IP)';
        }

        const deviceName = `${os} (${browser})`;
        const location = 'Maharashtra, India';
        const isCurrent = currentSessionId ? s.id === currentSessionId : false;

        return {
          id: s.id,
          ipAddress: cleanIp,
          deviceName,
          browser,
          os,
          deviceType,
          location,
          isCurrent,
          createdAt: s.created_at,
          lastUsedAt: s.last_used_at,
        };
      });

      // Deduplicate by IP address so each IP device is counted only once
      const uniqueSessionsMap = new Map<string, any>();
      for (const sess of sessions) {
        const key = (sess.ipAddress || '').toString().split(' ')[0].toLowerCase();
        if (!uniqueSessionsMap.has(key) || sess.isCurrent) {
          uniqueSessionsMap.set(key, sess);
        }
      }
      const uniqueSessions = Array.from(uniqueSessionsMap.values());

      res.status(200).json({ success: true, data: uniqueSessions });
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

      // Verify that user account exists on platform before resetting password
      if (!user) {
        return res.status(404).json({
          error: 'No account found with this email address. Please check the email entered or sign up for a new account.'
        });
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const redisKey = `reset:OTP:${normalizedEmail}`;

      // Store in OtpStore (Redis with in-memory fallback) with 10-minute expiry
      await OtpStore.setEx(redisKey, 600, JSON.stringify({ otp: otpCode, attempts: 0 }));

      console.log('\n=========================================\n🔑 PASSWORD RESET OTP CODE FOR', normalizedEmail, ':', otpCode, '\n=========================================\n');

      // Send Email
      await EmailService.sendPasswordResetOTP(normalizedEmail, otpCode, user.name);

      res.status(200).json({
        success: true,
        message: 'A 6-digit OTP verification code has been sent to your registered email address.'
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

      const payloadStr = await OtpStore.get(redisKey);
      if (!payloadStr) {
        return res.status(400).json({ error: 'OTP has expired or is invalid. Please request a new OTP.' });
      }

      const payload = JSON.parse(String(payloadStr));

      if (payload.attempts >= 5) {
        await OtpStore.del(redisKey);
        return res.status(400).json({ error: 'Maximum OTP attempts reached. Please request a new OTP.' });
      }

      if (payload.otp !== otpCode.trim()) {
        payload.attempts += 1;
        await OtpStore.setEx(redisKey, 600, JSON.stringify(payload));
        return res.status(400).json({ error: 'Invalid 6-digit OTP code' });
      }

      // Set Verified Key for 15 minutes
      const verifiedKey = `reset:VERIFIED:${normalizedEmail}`;
      await OtpStore.setEx(verifiedKey, 900, 'VERIFIED');

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
      const payloadStr = await OtpStore.get(redisKey);

      if (!payloadStr) {
        return res.status(400).json({ error: 'OTP verification session expired. Please start over.' });
      }

      const payload = JSON.parse(String(payloadStr));
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

      // Clean Redis / Memory store
      await OtpStore.del(redisKey);
      await OtpStore.del(`reset:VERIFIED:${normalizedEmail}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }

  // 7. Get Public User Profile (No Auth Required)
  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await UserRepository.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      const safeUser = sanitizeUserForResponse(user);
      res.status(200).json({
        success: true,
        user: safeUser
      });
    } catch (error) {
      next(error);
    }
  }

  // 8. Verify 2FA Login Code
  static async verify2FALogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { mfaToken, otpCode } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
      const userAgent = req.headers['user-agent'];

      const result = await Verify2FALoginService.execute(mfaToken, otpCode, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // 9. Toggle 2FA Setting
  static async toggle2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { enabled } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await pool.query(
        'UPDATE users SET is_two_factor_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [Boolean(enabled), userId]
      );
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
}

