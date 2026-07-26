import { redisClient } from '../../../config/redis';
import { AdvertisementRepository } from '../repositories/advertisementRepository';
import { UserRepository } from '../../auth/repositories/UserRepository';
import { EmailService } from '../../auth/services/EmailService';
import {
  Advertisement,
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
  AdvertisementAnalytics,
  SystemNotification,
} from '../types/advertisement.types';

const REDIS_CACHE_KEY = 'homepage:advertisements';
const CACHE_TTL_SECONDS = 600; // 10 minutes

export class AdvertisementService {
  /**
   * Clear Homepage Advertisement Cache from Redis
   */
  public static async invalidateCache(): Promise<void> {
    try {
      if (redisClient.isOpen) {
        await redisClient.del(REDIS_CACHE_KEY);
      }
    } catch (err) {
      console.error('Failed to invalidate Redis cache:', err);
    }
  }

  /**
   * Get Active Advertisements for Homepage Carousel (Direct PostgreSQL with Redis Sync)
   */
  public static async getPublicAdvertisements(limit: number = 10): Promise<Advertisement[]> {
    const ads = await AdvertisementRepository.findPublicActive(limit);

    try {
      if (redisClient.isOpen) {
        await redisClient.setEx(REDIS_CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(ads));
      }
    } catch (err) {
      console.warn('Redis write failed:', err);
    }

    return ads;
  }

  /**
   * Employer Creates Advertisement
   */
  public static async createEmployerAdvertisement(
    employerId: string,
    data: CreateAdvertisementInput
  ): Promise<Advertisement> {
    const ad = await AdvertisementRepository.create(employerId, 'EMPLOYER', {
      ...data,
      status: 'PENDING_APPROVAL',
    });

    await AdvertisementRepository.createNotification(
      employerId,
      'Advertisement Submitted',
      `Your banner "${ad.title}" has been submitted and is currently pending admin review.`,
      'AD_SUBMITTED',
      `/dashboard?tab=advertisements`
    );

    await this.invalidateCache();
    return ad;
  }

  /**
   * Fetch Employer's Advertisements
   */
  public static async getEmployerAdvertisements(employerId: string): Promise<Advertisement[]> {
    return AdvertisementRepository.findByOwner(employerId);
  }

  /**
   * Employer Updates / Resubmits Advertisement
   */
  public static async updateEmployerAdvertisement(
    adId: string,
    employerId: string,
    data: UpdateAdvertisementInput
  ): Promise<Advertisement> {
    const existing = await AdvertisementRepository.findById(adId);
    if (!existing) {
      throw new Error('Advertisement not found');
    }
    if (existing.owner_id !== employerId) {
      throw new Error('Unauthorized access to advertisement');
    }

    // Resubmitting resets status to PENDING_APPROVAL
    const isResubmit = existing.status === 'REJECTED';
    const updatedStatus = isResubmit ? 'PENDING_APPROVAL' : data.status || existing.status;

    const updated = await AdvertisementRepository.update(adId, {
      ...data,
      status: updatedStatus,
    });

    if (!updated) throw new Error('Failed to update advertisement');

    if (isResubmit) {
      await AdvertisementRepository.createNotification(
        employerId,
        'Advertisement Resubmitted',
        `Your banner "${updated.title}" was updated and resubmitted for admin review.`,
        'AD_RESUBMITTED',
        `/dashboard?tab=advertisements`
      );
    }

    await this.invalidateCache();
    return updated;
  }

  /**
   * Employer Deletes Advertisement
   */
  public static async deleteEmployerAdvertisement(adId: string, employerId: string): Promise<boolean> {
    const existing = await AdvertisementRepository.findById(adId);
    if (!existing) throw new Error('Advertisement not found');
    if (existing.owner_id !== employerId) throw new Error('Unauthorized action');

    const deleted = await AdvertisementRepository.delete(adId);
    if (deleted) {
      await AdvertisementRepository.createNotification(
        employerId,
        'Advertisement Deleted',
        `Your banner "${existing.title}" was deleted.`,
        'AD_DELETED',
        `/dashboard?tab=advertisements`
      );
      await this.invalidateCache();
    }
    return deleted;
  }

  /**
   * Get Employer Analytics
   */
  public static async getEmployerAnalytics(employerId: string): Promise<AdvertisementAnalytics> {
    return AdvertisementRepository.getEmployerAnalytics(employerId);
  }

  /**
   * Admin Gets All Advertisements
   */
  public static async getAllAdminAdvertisements(statusFilter?: string): Promise<Advertisement[]> {
    return AdvertisementRepository.findAllAdmin(statusFilter);
  }

  /**
   * Admin Creates Advertisement (Can publish immediately or schedule)
   */
  public static async createAdminAdvertisement(
    adminId: string,
    data: CreateAdvertisementInput
  ): Promise<Advertisement> {
    const status = data.status || 'APPROVED';
    const ad = await AdvertisementRepository.create(adminId, 'ADMIN', {
      ...data,
      status,
    });

    await this.invalidateCache();
    return ad;
  }

  /**
   * Admin Moderation: Approve Advertisement
   */
  public static async approveAdvertisement(adId: string, adminId: string): Promise<Advertisement> {
    const existing = await AdvertisementRepository.findById(adId);
    if (!existing) throw new Error('Advertisement not found');

    const updated = await AdvertisementRepository.updateStatus(adId, adminId, 'APPROVED');
    if (!updated) throw new Error('Failed to approve advertisement');

    if (existing.owner_id) {
      // 1. Create In-App Notification
      await AdvertisementRepository.createNotification(
        existing.owner_id,
        'Advertisement Approved!',
        `Congratulations! Your advertisement banner "${existing.title}" was approved and is now live on the homepage.`,
        'AD_APPROVED',
        `/dashboard?tab=advertisements`
      );

      // 2. Dispatch Professional Transactional Email to Employer
      try {
        const owner = await UserRepository.findById(existing.owner_id);
        if (owner && owner.email) {
          await EmailService.sendAdvertisementStatusEmail(
            owner.email,
            owner.name || 'Employer',
            existing.title,
            'APPROVED'
          );
        }
      } catch (emailErr) {
        console.error('Failed to send banner approval email:', emailErr);
      }
    }

    await this.invalidateCache();
    return updated;
  }

  /**
   * Admin Moderation: Reject Advertisement
   */
  public static async rejectAdvertisement(
    adId: string,
    adminId: string,
    reason: string
  ): Promise<Advertisement> {
    const existing = await AdvertisementRepository.findById(adId);
    if (!existing) throw new Error('Advertisement not found');

    const updated = await AdvertisementRepository.updateStatus(adId, adminId, 'REJECTED', reason);
    if (!updated) throw new Error('Failed to reject advertisement');

    if (existing.owner_id) {
      // 1. Create In-App Notification
      await AdvertisementRepository.createNotification(
        existing.owner_id,
        'Advertisement Needs Revision',
        `Your advertisement banner "${existing.title}" was rejected for reason: ${reason}. Please update and resubmit.`,
        'AD_REJECTED',
        `/dashboard?tab=advertisements`
      );

      // 2. Dispatch Professional Transactional Email to Employer
      try {
        const owner = await UserRepository.findById(existing.owner_id);
        if (owner && owner.email) {
          await EmailService.sendAdvertisementStatusEmail(
            owner.email,
            owner.name || 'Employer',
            existing.title,
            'REJECTED',
            reason
          );
        }
      } catch (emailErr) {
        console.error('Failed to send banner rejection email:', emailErr);
      }
    }

    await this.invalidateCache();
    return updated;
  }

  /**
   * Admin Moderation: Unpublish Advertisement (Set to Inactive / Unpublished)
   */
  public static async unpublishAdvertisement(
    adId: string,
    adminId: string
  ): Promise<Advertisement> {
    const existing = await AdvertisementRepository.findById(adId);
    if (!existing) throw new Error('Advertisement not found');

    const updated = await AdvertisementRepository.update(adId, {
      status: 'DRAFT',
      is_active: false
    });
    if (!updated) throw new Error('Failed to unpublish advertisement');

    if (existing.owner_id) {
      await AdvertisementRepository.createNotification(
        existing.owner_id,
        'Advertisement Unpublished',
        `Your advertisement banner "${existing.title}" was unpublished from the homepage by an administrator.`,
        'AD_UNPUBLISHED',
        `/dashboard?tab=advertisements`
      );
    }

    await this.invalidateCache();
    return updated;
  }

  /**
   * Admin Deletes Advertisement
   */
  public static async deleteAdminAdvertisement(adId: string): Promise<boolean> {
    const existing = await AdvertisementRepository.findById(adId);
    if (!existing) throw new Error('Advertisement not found');

    const deleted = await AdvertisementRepository.delete(adId);
    if (deleted && existing.owner_id) {
      await AdvertisementRepository.createNotification(
        existing.owner_id,
        'Advertisement Removed by Admin',
        `Your advertisement banner "${existing.title}" was removed by an administrator.`,
        'AD_DELETED',
        `/dashboard?tab=advertisements`
      );
      await this.invalidateCache();
    }
    return deleted;
  }

  /**
   * Admin Analytics
   */
  public static async getAdminAnalytics(): Promise<AdvertisementAnalytics> {
    return AdvertisementRepository.getAdminAnalytics();
  }

  /**
   * Analytics tracking methods
   */
  public static async recordClick(adId: string, userId?: string, ip?: string): Promise<void> {
    await AdvertisementRepository.recordClick(adId, userId, ip);
  }

  public static async recordView(adId: string, userId?: string): Promise<void> {
    await AdvertisementRepository.recordView(adId, userId);
  }

  /**
   * Notification helpers
   */
  public static async getUserNotifications(userId: string): Promise<SystemNotification[]> {
    return AdvertisementRepository.getUserNotifications(userId);
  }

  public static async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    await AdvertisementRepository.markNotificationRead(notificationId, userId);
  }

  public static async markAllNotificationsRead(userId: string): Promise<void> {
    await AdvertisementRepository.markAllNotificationsRead(userId);
  }

  public static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await AdvertisementRepository.deleteNotification(notificationId, userId);
  }
}
