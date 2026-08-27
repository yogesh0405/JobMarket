import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { AdvertisementService } from '../../../../src/modules/advertisements/services/advertisementService';

export class AdvertisementController {
  static async getPublicAdvertisements(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = req.query.placement as string | undefined;
      const data = await AdvertisementService.getPublicAdvertisements(placement);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async recordClick(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
      const userAgent = (req.headers['user-agent'] as string) || 'Unknown Device';
      const userId = (req as any).user?.userId;

      const data = await AdvertisementService.recordClick(id, ipAddress, userAgent, userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async recordView(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
      const userAgent = (req.headers['user-agent'] as string) || 'Unknown Device';
      const userId = (req as any).user?.userId;

      await AdvertisementService.recordView(id, ipAddress, userAgent, userId);
      res.status(200).json({ success: true, message: 'Impression recorded' });
    } catch (error) {
      next(error);
    }
  }

  static async createEmployerAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!employerId) return res.status(401).json({ error: 'Unauthorized' });

      const data = await AdvertisementService.createEmployerAdvertisement(employerId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getEmployerAdvertisements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!employerId) return res.status(401).json({ error: 'Unauthorized' });

      const data = await AdvertisementService.getEmployerAdvertisements(employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getEmployerAdvertisementById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!employerId) return res.status(401).json({ error: 'Unauthorized' });

      const id = req.params.id as string;
      const data = await AdvertisementService.getEmployerAdvertisementById(id, employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getEmployerAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!employerId) return res.status(401).json({ error: 'Unauthorized' });

      const data = await AdvertisementService.getEmployerAnalytics(employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateEmployerAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!employerId) return res.status(401).json({ error: 'Unauthorized' });

      const data = await AdvertisementService.updateEmployerAdvertisement(id, employerId, req.body);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEmployerAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!employerId) return res.status(401).json({ error: 'Unauthorized' });

      await AdvertisementService.deleteEmployerAdvertisement(id, employerId);
      res.status(200).json({ success: true, message: 'Advertisement deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async getAllAdminAdvertisements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdvertisementService.getAllAdminAdvertisements(req.query.status as string);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingAdminAdvertisements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdvertisementService.getPendingAdminAdvertisements();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdvertisementService.getAdminAnalytics();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createAdminAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.headers['x-user-id'] as string || req.user?.userId || 'admin';
      const data = await AdvertisementService.createAdminAdvertisement(adminId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async approveAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId || 'admin';
      const { notes } = req.body || {};
      const data = await AdvertisementService.approveAdvertisement(id, adminId, notes);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async rejectAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId || 'admin';
      const { rejectionReason, notes } = req.body || {};
      const data = await AdvertisementService.rejectAdvertisement(id, adminId, rejectionReason || notes);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async unpublish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId || 'admin';
      const { reason, unpublishReason, notes } = req.body || {};
      const data = await AdvertisementService.unpublishAdvertisement(id, adminId, reason || unpublishReason || notes);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAdminAdvertisement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await AdvertisementService.deleteAdminAdvertisement(id);
      res.status(200).json({ success: true, message: 'Advertisement deleted' });
    } catch (error) {
      next(error);
    }
  }
}
