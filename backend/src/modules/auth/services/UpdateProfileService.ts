import { UserRepository, User } from '../repositories/UserRepository';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';
import { S3Util } from '../../../utils/s3';

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
    midcZone?: string;
    midc_zone?: string;
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
      const oldKey = S3Util.extractKey(currentUser.resume.url);
      if (oldKey) {
        try {
          await S3Util.deleteFile(oldKey);
        } catch (err) {
          logger.error(`Failed to delete resume ${oldKey} from S3:`, err);
        }
      }
    }

    // Support root-level resumeUrl / resumeName parameters if passed
    if ((profileData as any).resumeUrl && !profileData.resume) {
      profileData.resume = {
        url: (profileData as any).resumeUrl,
        name: (profileData as any).resumeName || 'Candidate_Resume.pdf',
        isPublic: (profileData as any).isResumePublic !== false,
        uploadedAt: currentUser.resume?.uploadedAt || (currentUser as any).updated_at || new Date().toISOString()
      };
    }

    if (profileData.resume) {
      if (!profileData.resume.uploadedAt || profileData.resume.url?.startsWith('data:')) {
        profileData.resume.uploadedAt = (profileData.resume.url?.startsWith('data:'))
          ? new Date().toISOString()
          : (currentUser.resume?.uploadedAt || (currentUser as any).updated_at || new Date().toISOString());
      }
    }

    // Mandatory Backend Resume Validation (Size Max 5MB & Format Validation)
    if (profileData.resume && profileData.resume.url && typeof profileData.resume.url === 'string') {
      const resumeUrlStr = profileData.resume.url;
      if (resumeUrlStr.startsWith('data:')) {
        // Calculate exact byte size from base64 string
        const base64Length = resumeUrlStr.length - (resumeUrlStr.indexOf(',') + 1);
        const sizeInBytes = Math.round((base64Length * 3) / 4);

        if (sizeInBytes > 5 * 1024 * 1024) {
          throw new BadRequestError('Resume file size exceeds the maximum allowed 5MB limit. Please upload a smaller document.');
        }

        const mimeMatch = resumeUrlStr.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1].toLowerCase() : '';
        const fileName = (profileData.resume.name || (profileData as any).resumeName || '').toLowerCase();

        const isAllowedMime = mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('msword') || mimeType.includes('officedocument') || mimeType.includes('image') || mimeType.includes('octet-stream');
        const isAllowedExt = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.webp');

        if (mimeType && !isAllowedMime && fileName && !isAllowedExt) {
          throw new BadRequestError('Invalid resume file format. Accepted formats: PDF, Word (.doc, .docx), PNG, JPG, JPEG.');
        }
      }
    }

    // Check if new resume base64 data is uploaded
    if (profileData.resume && profileData.resume.url && profileData.resume.url.startsWith('data:')) {
      // Clean up old resume from S3 first if it exists
      if (currentUser.resume?.url) {
        const oldKey = S3Util.extractKey(currentUser.resume.url);
        if (oldKey) {
          try {
            await S3Util.deleteFile(oldKey);
          } catch (err) {
            logger.error(`Failed to delete old resume ${oldKey} from S3:`, err);
          }
        }
      }

      try {
        const customKey = `resume_${userId}_${Date.now()}`;
        const secureUrl = await S3Util.uploadFile(profileData.resume.url, 'resumes', customKey);
        profileData.resume.url = secureUrl;
      } catch (err: any) {
        logger.error('Failed to upload user resume to S3, proceeding with direct storage:', err);
      }
    }

    // Check if new profile picture or company logo base64 data is uploaded
    const photoUrl =
      profileData.profilePictureUrl ||
      profileData.profile_picture_url ||
      (profileData as any).avatar ||
      (profileData as any).avatarUrl ||
      (profileData as any).companyLogo ||
      (profileData as any).company_logo ||
      (profileData as any).logo ||
      (profileData as any).logoUrl;

    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('data:image/')) {
      if (currentUser.profile_picture_url) {
        const oldKey = S3Util.extractKey(currentUser.profile_picture_url);
        if (oldKey) {
          try {
            await S3Util.deleteFile(oldKey);
          } catch (err) {
            logger.error(`Failed to delete old avatar ${oldKey} from S3:`, err);
          }
        }
      }

      try {
        const customKey = `avatar_${userId}_${Date.now()}`;
        const secureUrl = await S3Util.uploadImage(photoUrl, 'profiles', customKey);
        profileData.profilePictureUrl = secureUrl;
        profileData.profile_picture_url = secureUrl;
        (profileData as any).avatar = secureUrl;
        (profileData as any).companyLogo = secureUrl;
        (profileData as any).company_logo = secureUrl;
        (profileData as any).logo = secureUrl;
      } catch (err: any) {
        logger.error('Failed to upload profile picture / company logo to S3:', err);
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
