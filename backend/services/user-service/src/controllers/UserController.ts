import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../../../src/modules/auth/repositories/UserRepository';
import { UpdateProfileService } from '../../../../src/modules/auth/services/UpdateProfileService';
import { CloudinaryUtil } from '../../../../shared/utils/cloudinary';
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
        const publicId = CloudinaryUtil.extractPublicId(user.resume.url);
        if (publicId) {
          try { await CloudinaryUtil.deleteFile(publicId); } catch (e) {}
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
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
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

      if (!finalUrl) return res.status(400).json({ error: 'Resume URL or file data is required' });

      const currentUser = await UserRepository.findById(userId);
      if (currentUser?.resume?.url && currentUser.resume.url !== finalUrl) {
        const oldPublicId = CloudinaryUtil.extractPublicId(currentUser.resume.url);
        if (oldPublicId) {
          try { await CloudinaryUtil.deleteFile(oldPublicId); } catch (e) {}
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
      if (!image.startsWith('data:image/webp;base64,')) {
        return res.status(400).json({ error: 'Only WebP images are supported for profile pictures' });
      }

      const user = await UserRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.profile_picture_url) {
        const oldPublicId = CloudinaryUtil.extractPublicId(user.profile_picture_url);
        if (oldPublicId) {
          try { await CloudinaryUtil.deleteImage(oldPublicId); } catch (e) {}
        }
      }

      const publicId = `user_${userId}_${Date.now()}`;
      const secureUrl = await CloudinaryUtil.uploadImage(image, 'profiles', publicId);
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
        const publicId = CloudinaryUtil.extractPublicId(user.profile_picture_url);
        if (publicId) {
          try { await CloudinaryUtil.deleteImage(publicId); } catch (e) {}
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
