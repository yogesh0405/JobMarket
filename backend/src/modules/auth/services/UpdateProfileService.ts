import { UserRepository, User } from '../repositories/UserRepository';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';
import { CloudinaryUtil } from '../../../utils/cloudinary';

export class UpdateProfileService {
  static async execute(userId: string, profileData: {
    name: string;
    phone?: string;
    companyName?: string;
    gstNumber?: string;
    tradeSpecialization?: string;
    headline?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    preferredShift?: string;
    requiresBus?: boolean;
    requiresAccommodation?: boolean;
    resume?: any;
    experience?: any[];
    education?: any[];
    profilePictureUrl?: string;
    profile_picture_url?: string;
  }): Promise<Omit<User, 'password_hash'>> {
    if (profileData.name !== undefined && (!profileData.name || !profileData.name.trim())) {
      throw new BadRequestError('Name is required');
    }

    const currentUser = await UserRepository.findById(userId);
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    // Check if resume is being deleted (passed as null)
    if (profileData.resume === null && currentUser.resume?.url) {
      const oldPublicId = CloudinaryUtil.extractPublicId(currentUser.resume.url);
      if (oldPublicId) {
        try {
          await CloudinaryUtil.deleteFile(oldPublicId);
        } catch (err) {
          logger.error(`Failed to delete resume ${oldPublicId} from Cloudinary:`, err);
        }
      }
    }

    // Check if new resume base64 data is uploaded
    if (profileData.resume && profileData.resume.url && profileData.resume.url.startsWith('data:')) {
      // Clean up old resume from Cloudinary first if it exists
      if (currentUser.resume?.url) {
        const oldPublicId = CloudinaryUtil.extractPublicId(currentUser.resume.url);
        if (oldPublicId) {
          try {
            await CloudinaryUtil.deleteFile(oldPublicId);
          } catch (err) {
            logger.error(`Failed to delete old resume ${oldPublicId} from Cloudinary:`, err);
          }
        }
      }

      try {
        const publicId = `resume_${userId}`;
        const secureUrl = await CloudinaryUtil.uploadFile(profileData.resume.url, 'resumes', publicId);
        profileData.resume.url = secureUrl;
      } catch (err: any) {
        logger.error('Failed to upload user resume to Cloudinary:', err);
        throw new BadRequestError(`Failed to save resume: ${err.message}`);
      }
    }

    const updatedUser = await UserRepository.updateProfile(userId, profileData);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    const { password_hash, ...safeUser } = updatedUser;
    logger.info(`Profile updated for user: ${userId}`);
    return safeUser;
  }
}
