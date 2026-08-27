import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../../../src/modules/auth/repositories/UserRepository';
import { UpdateProfileService } from '../../../../src/modules/auth/services/UpdateProfileService';
import { S3Util } from '../../../../shared/utils/s3';
import { AuthenticatedRequest } from '../../../../shared/types';
import { sanitizeUserForResponse } from '../../../auth-service/src/controllers/AuthController';

export class UserController {
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

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await UpdateProfileService.execute(userId, req.body);
      res.status(200).json({ success: true, data: sanitizeUserForResponse(result) });
    } catch (error) {
      next(error);
    }
  }

  static async getResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.headers['x-user-id'] as string || req.user?.userId;
      const currentUserRole = req.headers['x-user-role'] as string || req.user?.role || 'candidate';

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
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const user = await UserRepository.findById(userId);

      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.resume && user.resume.url) {
        const oldKey = S3Util.extractKey(user.resume.url);
        if (oldKey) {
          try { await S3Util.deleteFile(oldKey); } catch (e) {}
        }
      }

      const updatedUser = await UserRepository.updateProfile(userId, { resume: null });
      res.status(200).json({ success: true, data: sanitizeUserForResponse(updatedUser) });
    } catch (error) {
      next(error);
    }
  }

  static async getResumeSignature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
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
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { name, fileName, size, type, url, base64, file } = req.body;

      const base64Data = base64 || file;
      const fileTitle = fileName || name || 'Resume_BioData.jpg';

      let finalUrl = url;
      if (finalUrl && typeof finalUrl === 'string') {
        const lowerUrl = finalUrl.toLowerCase().trim();
        if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
          return res.status(400).json({ error: 'Invalid URL format. Resume URL must use http:// or https://' });
        }
      }

      if (!finalUrl && base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const customKey = `resume_${userId}_${Date.now()}`;
        finalUrl = await S3Util.uploadFile(base64Data, 'resumes', customKey);
      }

      if (!finalUrl) return res.status(400).json({ error: 'Resume URL or file data is required' });

      const currentUser = await UserRepository.findById(userId);
      if (currentUser?.resume?.url && currentUser.resume.url !== finalUrl) {
        const oldKey = S3Util.extractKey(currentUser.resume.url);
        if (oldKey) {
          try { await S3Util.deleteFile(oldKey); } catch (e) {}
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
      res.status(200).json({ success: true, url: finalUrl, data: sanitizeUserForResponse(updatedUser) });
    } catch (error) {
      next(error);
    }
  }

  static async uploadProfilePicture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { image } = req.body;

      if (!image) return res.status(400).json({ error: 'Image data is required' });
      if (!image.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
      }

      const user = await UserRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.profile_picture_url) {
        const oldKey = S3Util.extractKey(user.profile_picture_url);
        if (oldKey) {
          try { await S3Util.deleteImage(oldKey); } catch (e) {}
        }
      }

      const customKey = `avatar_${userId}_${Date.now()}`;
      const secureUrl = await S3Util.uploadImage(image, 'profiles', customKey);
      const updatedUser = await UserRepository.updateProfile(userId, { profile_picture_url: secureUrl });

      res.status(200).json({ success: true, data: sanitizeUserForResponse(updatedUser) });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfilePicture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const user = await UserRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.profile_picture_url) {
        const oldKey = S3Util.extractKey(user.profile_picture_url);
        if (oldKey) {
          try { await S3Util.deleteImage(oldKey); } catch (e) {}
        }
      }

      const updatedUser = await UserRepository.updateProfile(userId, { profile_picture_url: null } as any);
      res.status(200).json({ success: true, data: sanitizeUserForResponse(updatedUser) });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) return res.status(400).json({ error: 'User ID is required' });

      const user = await UserRepository.findById(id);
      if (!user) return res.status(404).json({ error: 'User profile not found' });

      res.status(200).json({ success: true, user: sanitizeUserForResponse(user) });
    } catch (error) {
      next(error);
    }
  }
}
