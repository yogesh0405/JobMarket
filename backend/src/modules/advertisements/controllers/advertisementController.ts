import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { AdvertisementService } from '../services/advertisementService';

export class AdvertisementController {
  /**
   * GET /api/v1/home/advertisements
   * Public endpoint returning active homepage advertisements (cached in Redis)
   */
  public static async getPublicAdvertisements(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const ads = await AdvertisementService.getPublicAdvertisements(limit);
      res.json({
        success: true,
        data: ads,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/home/advertisements/:id/click
   * Record click event on an advertisement banner
   */
  public static async recordClick(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const rawIp = req.ip || req.socket.remoteAddress;
      const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;
      await AdvertisementService.recordClick(id, userId, ip);
      res.json({ success: true, message: 'Click recorded' });
    } catch (error) {
      // Respond gracefully for non-critical analytics background recording
      res.json({ success: false, message: 'Click recording skipped' });
    }
  }

  /**
   * POST /api/v1/home/advertisements/:id/view
   * Record view impression event on an advertisement banner
   */
  public static async recordView(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      await AdvertisementService.recordView(id, userId);
      res.json({ success: true, message: 'View recorded' });
    } catch (error) {
      // Respond gracefully for non-critical analytics background recording
      res.json({ success: false, message: 'View recording skipped' });
    }
  }

  /**
   * Employer Endpoints
   */
  public static async createEmployerAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const ad = await AdvertisementService.createEmployerAdvertisement(employerId, req.body);
      res.status(201).json({
        success: true,
        message: 'Advertisement submitted successfully for admin approval',
        data: ad,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getEmployerAdvertisements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const ads = await AdvertisementService.getEmployerAdvertisements(employerId);
      res.json({ success: true, data: ads });
    } catch (error) {
      next(error);
    }
  }

  public static async getEmployerAdvertisementById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const id = req.params.id as string;
      const ad = await AdvertisementService.getEmployerAdvertisementById(id, employerId);
      res.json({ success: true, data: ad });
    } catch (error) {
      next(error);
    }
  }

  public static async updateEmployerAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const id = req.params.id as string;
      const updated = await AdvertisementService.updateEmployerAdvertisement(id, employerId, req.body);
      res.json({
        success: true,
        message: 'Advertisement updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteEmployerAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const id = req.params.id as string;
      await AdvertisementService.deleteEmployerAdvertisement(id, employerId);
      res.json({ success: true, message: 'Advertisement deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async getEmployerAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const analytics = await AdvertisementService.getEmployerAnalytics(employerId);
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Endpoints
   */
  public static async getAllAdminAdvertisements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const statusFilter = req.query.status as string;
      const ads = await AdvertisementService.getAllAdminAdvertisements(statusFilter);
      res.json({ success: true, data: ads });
    } catch (error) {
      next(error);
    }
  }

  public static async getPendingAdminAdvertisements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ads = await AdvertisementService.getAllAdminAdvertisements('PENDING_APPROVAL');
      res.json({ success: true, data: ads });
    } catch (error) {
      next(error);
    }
  }

  public static async createAdminAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const ad = await AdvertisementService.createAdminAdvertisement(adminId, req.body);
      res.status(201).json({
        success: true,
        message: 'Admin advertisement created successfully',
        data: ad,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async approveAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const id = req.params.id as string;
      const approved = await AdvertisementService.approveAdvertisement(id, adminId);
      res.json({
        success: true,
        message: 'Advertisement approved and published',
        data: approved,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async rejectAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const id = req.params.id as string;
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required' });
      }
      const rejected = await AdvertisementService.rejectAdvertisement(id, adminId, reason);
      res.json({
        success: true,
        message: 'Advertisement rejected with reason',
        data: rejected,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async unpublish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user?.userId || (req as any).user?.id || 'admin';
      const id = req.params.id as string;
      const { reason, unpublishReason, notes } = req.body || {};
      const ad = await AdvertisementService.unpublishAdvertisement(id, adminId, reason || unpublishReason || notes);
      res.json({ success: true, data: ad, message: 'Advertisement unpublished successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteAdminAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await AdvertisementService.deleteAdminAdvertisement(id);
      res.json({ success: true, message: 'Advertisement deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async getAdminAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await AdvertisementService.getAdminAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  /**
   * System Notifications
   */
  public static async getUserNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = await AdvertisementService.getUserNotifications(userId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  public static async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      await AdvertisementService.markNotificationRead(id, userId);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await AdvertisementService.markAllNotificationsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      await AdvertisementService.deleteNotification(id, userId);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }
}
