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
import { S3Util } from '../../../utils/s3';
import { generateTokens } from '../../../utils/jwt';

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
      const { extractClientIp } = await import('../../../utils/deviceDetector');
      const ip = extractClientIp(req);
      const userAgent = req.headers['user-agent'];
      const customDeviceName = req.headers['x-device-name'] as string;

      const result = await LoginService.execute(email, password, role, ip, userAgent, customDeviceName, req.headers);
      if ((result as any).require2FA || (result as any).requires2FA) {
        return res.status(200).json({
          success: true,
          message: result.message,
          require2FA: true,
          requires2FA: true,
          mfaToken: result.mfaToken,
          email: result.email,
          data: {
            require2FA: true,
            requires2FA: true,
            mfaToken: result.mfaToken,
            email: result.email,
            message: result.message
          }
        });
      }
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
      if (!user || !user.resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      let resumeObj: any = null;
      if (typeof user.resume === 'object' && user.resume !== null) {
        resumeObj = user.resume;
      } else if (typeof user.resume === 'string' && user.resume.trim()) {
        try {
          resumeObj = JSON.parse(user.resume);
        } catch (_) {
          resumeObj = { url: user.resume, name: 'Candidate_Resume.pdf' };
        }
      }

      const resumeUrl = resumeObj?.url || (typeof user.resume === 'string' ? user.resume : null);
      if (!resumeUrl) {
        return res.status(404).json({ error: 'Resume file URL not found' });
      }

      res.status(200).json({ success: true, url: resumeUrl, resume: resumeObj });
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
        const oldKey = S3Util.extractKey(user.resume.url);
        if (oldKey) {
          try {
            await S3Util.deleteFile(oldKey);
          } catch (err) {
            console.error('Failed to delete resume file from S3:', err);
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
      const filename = (req.query.filename as string) || `resume_${userId}_${Date.now()}.pdf`;
      const contentType = (req.query.contentType as string) || 'application/pdf';
      const presignedData = await S3Util.getPresignedUploadUrl('resumes', filename, contentType);
      res.status(200).json({ success: true, data: presignedData });
    } catch (error) {
      next(error);
    }
  }

  static async uploadResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { name, fileName, size, type, url, base64, file } = req.body;

      const base64Data = base64 || file;
      const fileTitle = fileName || name || 'Resume_BioData.pdf';

      if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const base64Length = base64Data.length - (base64Data.indexOf(',') + 1);
        const sizeInBytes = Math.round((base64Length * 3) / 4);

        if (sizeInBytes > 5 * 1024 * 1024) {
          return res.status(400).json({ success: false, error: 'Resume file size exceeds the maximum allowed 5MB limit.' });
        }
      }

      let finalUrl = url;
      if (!finalUrl && base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const customKey = `resume_${userId}_${Date.now()}`;
        finalUrl = await S3Util.uploadFile(base64Data, 'resumes', customKey);
      }

      if (!finalUrl) {
        return res.status(400).json({ error: 'Resume URL or file data is required' });
      }

      const currentUser = await UserRepository.findById(userId);
      if (currentUser?.resume?.url && currentUser.resume.url !== finalUrl) {
        const oldKey = S3Util.extractKey(currentUser.resume.url);
        if (oldKey) {
          try {
            await S3Util.deleteFile(oldKey);
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

      if (!image.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.profile_picture_url) {
        const oldKey = S3Util.extractKey(user.profile_picture_url);
        if (oldKey) {
          try {
            await S3Util.deleteImage(oldKey);
          } catch (err) {
            console.error('Failed to delete old profile image from S3:', err);
          }
        }
      }

      const customKey = `avatar_${userId}_${Date.now()}`;
      const secureUrl = await S3Util.uploadImage(image, 'profiles', customKey);

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
        const oldKey = S3Util.extractKey(user.profile_picture_url);
        if (oldKey) {
          await S3Util.deleteImage(oldKey);
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
      const { detectDeviceFromHeaders, extractClientIp } = await import('../../../utils/deviceDetector');
      const rawSessions = await SessionRepository.findActiveUserSessions(userId);
      const reqClientIp = extractClientIp(req);

      let parsedSessions = rawSessions.map((s) => {
        const isCurrentById = currentSessionId ? s.id === currentSessionId : false;
        const detected = detectDeviceFromHeaders(
          s.user_agent,
          s.ip_address,
          s.device_name,
          isCurrentById ? req.headers : undefined
        );

        return {
          id: s.id,
          ipAddress: detected.ipAddress,
          ip_address: detected.ipAddress,
          deviceName: detected.deviceName,
          device_name: detected.deviceName,
          browser: detected.browser,
          os: detected.os,
          deviceType: detected.deviceType,
          device_type: detected.deviceType,
          location: detected.location,
          isCurrent: isCurrentById,
          is_current: isCurrentById,
          createdAt: s.created_at,
          created_at: s.created_at,
          lastUsedAt: s.last_used_at || s.created_at,
          last_used_at: s.last_used_at || s.created_at,
        };
      });

      // Check if the current calling device already has an active session in the list
      const reqUserAgent = (req.headers['user-agent'] as string) || '';
      const detectedCalling = detectDeviceFromHeaders(
        reqUserAgent,
        reqClientIp,
        req.headers['x-device-name'] as string,
        req.headers
      );

      const hasMatchingCurrent = parsedSessions.some(
        (s) => (currentSessionId && s.id === currentSessionId) ||
               (s.os === detectedCalling.os && s.deviceType === detectedCalling.deviceType && s.ipAddress === reqClientIp)
      );

      if (!hasMatchingCurrent && userId) {
        const newSession = await SessionRepository.createSession(
          userId,
          'active_session',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          detectedCalling.ipAddress,
          reqUserAgent,
          detectedCalling.deviceName
        ).catch(() => null);

        if (newSession) {
          parsedSessions.unshift({
            id: newSession.id,
            ipAddress: detectedCalling.ipAddress,
            ip_address: detectedCalling.ipAddress,
            deviceName: detectedCalling.deviceName,
            device_name: detectedCalling.deviceName,
            browser: detectedCalling.browser,
            os: detectedCalling.os,
            deviceType: detectedCalling.deviceType,
            device_type: detectedCalling.deviceType,
            location: detectedCalling.location,
            isCurrent: true,
            is_current: true,
            createdAt: newSession.created_at,
            created_at: newSession.created_at,
            lastUsedAt: newSession.created_at,
            last_used_at: newSession.created_at,
          });
        }
      }

      // Deduplicate by normalized (deviceName + ipAddress)
      const deduplicatedMap = new Map<string, any>();
      for (const sess of parsedSessions) {
        const normIp = (sess.ipAddress || '127.0.0.1').trim().toLowerCase();
        const normDevice = (sess.deviceName || `${sess.browser} on ${sess.os}`).trim().toLowerCase();
        const clusterKey = `${normDevice}___${normIp}`;

        if (!deduplicatedMap.has(clusterKey)) {
          deduplicatedMap.set(clusterKey, sess);
        } else {
          const existing = deduplicatedMap.get(clusterKey);
          const isCurr = existing.isCurrent || sess.isCurrent;
          const newest = new Date(sess.lastUsedAt).getTime() > new Date(existing.lastUsedAt).getTime() ? sess : existing;

          deduplicatedMap.set(clusterKey, {
            ...newest,
            isCurrent: isCurr,
            is_current: isCurr,
          });
        }
      }

      let deduplicatedSessions = Array.from(deduplicatedMap.values());

      // Ensure at least one session is marked as the current active device
      const hasCurrent = deduplicatedSessions.some((s) => s.isCurrent);
      if (!hasCurrent && deduplicatedSessions.length > 0) {
        let matchedIdx = deduplicatedSessions.findIndex((s) => s.ipAddress === reqClientIp);
        if (matchedIdx === -1) matchedIdx = 0;

        deduplicatedSessions = deduplicatedSessions.map((s, idx) => ({
          ...s,
          isCurrent: idx === matchedIdx,
          is_current: idx === matchedIdx,
        }));
      }

      // Sort current device to index 0, followed by most recent lastUsedAt
      deduplicatedSessions.sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
      });

      res.status(200).json({ success: true, data: deduplicatedSessions });
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

      // Generate refreshed tokens for the user so current session remains completely intact
      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        role: user.role,
        sessionId: req.sessionId
      });

      if (req.sessionId) {
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await pool.query('UPDATE sessions SET refresh_token_hash = $1 WHERE id = $2', [refreshTokenHash, req.sessionId]).catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        tokens: { accessToken, refreshToken },
        sessionId: req.sessionId
      });
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

      // Generate new active session & tokens so user session remains valid
      const { detectDeviceFromHeaders } = await import('../../../utils/deviceDetector');
      const reqIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const reqAgent = req.headers['user-agent'] || '';
      const customDevName = req.headers['x-device-name'] as string;
      const detected = detectDeviceFromHeaders(reqAgent, reqIp, customDevName, req.headers);

      const newSession = await SessionRepository.createSession(
        user.id,
        'temp_hash',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        detected.ipAddress,
        reqAgent,
        detected.deviceName
      );

      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        role: user.role,
        sessionId: newSession.id
      });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await pool.query('UPDATE sessions SET refresh_token_hash = $1 WHERE id = $2', [refreshTokenHash, newSession.id]);

      // Clean Redis / Memory store
      await OtpStore.del(redisKey);
      await OtpStore.del(`reset:VERIFIED:${normalizedEmail}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully.',
        tokens: { accessToken, refreshToken },
        sessionId: newSession.id,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
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
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      let userId = req.user?.userId || req.user?.id;
      if (token) {
        try {
          const { verifyAccessToken } = await import('../../../utils/jwt');
          const decoded = verifyAccessToken(token);
          if (decoded && (decoded.userId || decoded.id)) {
            userId = decoded.userId || decoded.id;
          }
        } catch (_) {}
      }

      if (!userId || userId === '00000000-0000-0000-0000-000000000001') {
        return res.status(401).json({ success: false, error: 'Unauthorized: Active login session required to update 2FA.' });
      }

      const { enabled } = req.body;
      const isEnabled = Boolean(enabled);

      await pool.query(
        'UPDATE users SET is_two_factor_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [isEnabled, userId]
      );
      await CacheService.invalidate(`user:profile:${userId}`);

      res.status(200).json({
        success: true,
        isTwoFactorEnabled: isEnabled,
        is_two_factor_enabled: isEnabled,
        message: isEnabled ? 'Two-Factor Authentication (2FA) is now ENABLED.' : 'Two-Factor Authentication (2FA) is now DISABLED.'
      });
    } catch (error) {
      next(error);
    }
  }

  // 10. Google 100% Free OAuth Authentication (Industry Grade)
  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, accessToken: googleAccessToken, role = 'candidate' } = req.body;
      let userEmail = req.body.email;
      let userName = req.body.name;
      let userPicture = req.body.picture;
      let userGoogleId = req.body.googleId;

      // 1. If googleAccessToken provided (from useGoogleLogin popup flow)
      if (googleAccessToken && !userEmail) {
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${googleAccessToken}` },
          });
          if (userinfoRes.ok) {
            const profile = await userinfoRes.json();
            userEmail = profile.email;
            userName = profile.name || profile.given_name || profile.email?.split('@')[0];
            userPicture = profile.picture || null;
            userGoogleId = profile.sub;
          }
        } catch (fetchErr: any) {
          console.error('Google accessToken verification error:', fetchErr.message);
        }
      }

      // 2. If idToken provided (from Google GSI / Expo Auth Session)
      if (idToken) {
        try {
          const { OAuth2Client } = await import('google-auth-library');
          const googleClient = new OAuth2Client();
          const allowedAudiences = [
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_ANDROID_CLIENT_ID,
            '324729375491-nl1j4657c42169gptkb1tm8ttoqkce8q.apps.googleusercontent.com',
            '324729375491-21ieq19k1mu4krikbroub3afjibjrghd.apps.googleusercontent.com',
          ].filter(Boolean) as string[];

          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: allowedAudiences,
          });
          const payload = ticket.getPayload();
          if (payload && payload.email) {
            userEmail = payload.email;
            userName = payload.name || userName || payload.email.split('@')[0];
            userPicture = payload.picture || userPicture || null;
            userGoogleId = payload.sub;
          }
        } catch (verifyErr: any) {
          // Fallback to tokeninfo endpoint
          try {
            const tokeninfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            if (tokeninfoRes.ok) {
              const info = await tokeninfoRes.json();
              if (info.email) {
                userEmail = info.email;
                userName = info.name || userName || info.email.split('@')[0];
                userPicture = info.picture || userPicture || null;
                userGoogleId = info.sub;
              }
            }
          } catch (_) {}
        }
      }

      if (!userEmail) {
        return res.status(401).json({ 
          success: false, 
          message: 'Google authentication failed: Could not verify Google credentials.' 
        });
      }

      let user = await UserRepository.findByEmail(userEmail.toLowerCase().trim());

      if (!user) {
        let permanentAvatarUrl: string | null = null;
        if (userPicture) {
          try {
            permanentAvatarUrl = await S3Util.uploadFromUrl(userPicture, 'profiles', `avatar_google_${userGoogleId || Date.now()}`);
          } catch (_) {
            permanentAvatarUrl = userPicture;
          }
        }

        const dummyPassword = await bcrypt.hash(`google_${userGoogleId || Date.now()}_${Math.random()}`, 12);
        user = await UserRepository.createUser({
          email: userEmail.toLowerCase().trim(),
          name: userName || userEmail.split('@')[0],
          password_hash: dummyPassword,
          role: role || 'candidate',
          status: 'ACTIVE',
          profile_picture_url: permanentAvatarUrl || null,
        } as any);
      } else if (!user.profile_picture_url && userPicture) {
        // Only if user had NO profile picture previously, store Google photo once in S3
        let permanentAvatarUrl = userPicture;
        try {
          permanentAvatarUrl = await S3Util.uploadFromUrl(userPicture, 'profiles', `avatar_google_${user.id}`);
        } catch (_) {}
        await pool.query('UPDATE users SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2', [permanentAvatarUrl, user.id]);
        user.profile_picture_url = permanentAvatarUrl;
        await CacheService.invalidate(`user:profile:${user.id}`).catch(() => {});
      }

      const safeUser = sanitizeUserForResponse(user);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const { detectDeviceFromHeaders, extractClientIp } = await import('../../../utils/deviceDetector');
      const ip = extractClientIp(req);
      const userAgent = (req.headers['user-agent'] as string) || '';
      const detected = detectDeviceFromHeaders(userAgent, ip);

      const session = await SessionRepository.createSession(user.id, 'temp_hash', expiresAt, detected.ipAddress, userAgent, detected.deviceName);
      const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role, sessionId: session.id });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await pool.query('UPDATE sessions SET refresh_token_hash = $1 WHERE id = $2', [refreshTokenHash, session.id]);

      res.status(200).json({
        success: true,
        message: 'Google Sign-In successful!',
        data: {
          user: safeUser,
          token: accessToken,
          refreshToken,
          sessionId: session?.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 11. Google Mobile OAuth Initiation
  static async googleMobileLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.query.role as string) || 'candidate';
      const host = req.get('host') || 'jobmarket-ongn.onrender.com';
      const protocol = req.protocol === 'https' || host.includes('onrender.com') ? 'https' : req.protocol;
      const redirectUri = `${protocol}://${host}/api/v1/auth/google/callback`;
      const clientId = process.env.GOOGLE_CLIENT_ID || '324729375491-nl1j4657c42169gptkb1tm8ttoqkce8q.apps.googleusercontent.com';
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&state=${encodeURIComponent(role)}&prompt=select_account`;
      res.redirect(googleUrl);
    } catch (err) {
      next(err);
    }
  }

  // 12. Google Mobile OAuth Callback Bridge
  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authenticating...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; text-align: center; }
    .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 360px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3 style="margin: 0 0 8px; font-size: 18px;">Authenticating with JobMarket</h3>
    <p style="color: #64748b; font-size: 14px; margin: 0;">Returning to the app...</p>
  </div>
  <script>
    (function() {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const targetUrl = 'jobmarket://oauth' + (hash || search || '');
      window.location.href = targetUrl;
      setTimeout(function() {
        window.location.href = targetUrl;
      }, 400);
    })();
  </script>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      next(err);
    }
  }
}

