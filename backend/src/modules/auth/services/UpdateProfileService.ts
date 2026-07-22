import { UserRepository, User } from '../repositories/UserRepository';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';

export class UpdateProfileService {
  static async execute(userId: string, profileData: {
    name: string;
    phone?: string;
    companyName?: string;
    gstNumber?: string;
    tradeSpecialization?: string;
    headline?: string;
    location?: string;
    skills?: string[];
    preferredShift?: string;
    requiresBus?: boolean;
    requiresAccommodation?: boolean;
    resume?: any;
  }): Promise<Omit<User, 'password_hash'>> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (profileData.name !== undefined && (!profileData.name || !profileData.name.trim())) {
      throw new BadRequestError('Name is required');
    }

    const updatedUser = await UserRepository.updateProfile(userId, {
      name: profileData.name !== undefined ? profileData.name : user.name,
      phone: profileData.phone !== undefined ? profileData.phone : user.phone,
      company_name: profileData.companyName !== undefined ? profileData.companyName : user.company_name,
      gst_number: profileData.gstNumber !== undefined ? profileData.gstNumber : user.gst_number,
      trade_specialization: profileData.tradeSpecialization !== undefined ? profileData.tradeSpecialization : user.trade_specialization,
      headline: profileData.headline !== undefined ? profileData.headline : user.headline,
      location: profileData.location !== undefined ? profileData.location : user.location,
      skills: profileData.skills !== undefined ? profileData.skills : user.skills,
      preferred_shift: profileData.preferredShift !== undefined ? profileData.preferredShift : user.preferred_shift,
      requires_bus: profileData.requiresBus !== undefined ? profileData.requiresBus : user.requires_bus,
      requires_accommodation: profileData.requiresAccommodation !== undefined ? profileData.requiresAccommodation : user.requires_accommodation,
      resume: profileData.resume !== undefined ? profileData.resume : user.resume
    });

    const { password_hash, ...safeUser } = updatedUser;
    logger.info(`Profile updated for user: ${userId}`);
    return safeUser;
  }
}
