import { Request, Response, NextFunction } from 'express';
import { SignupService } from '../services/SignupService';
import { VerifyOTPService } from '../services/VerifyOTPService';
import { LoginService } from '../services/LoginService';
import { TokenService } from '../services/TokenService';
import { LogoutService } from '../services/LogoutService';
import { UpdateProfileService } from '../services/UpdateProfileService';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';
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
}
