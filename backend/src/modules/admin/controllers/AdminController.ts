import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { AdminService } from '../services/AdminService';

export class AdminController {
  // Dashboard statistics
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardData();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Users management
  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;
      const role = req.query.role as string;
      const status = req.query.status as string;
      const verified = req.query.verified as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'ASC' | 'DESC';

      const result = await AdminService.listUsers({
        page,
        limit,
        search,
        role,
        status,
        verified,
        sortBy,
        sortOrder
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await AdminService.getUserDetails(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.updateUserStatus(id, status, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.deleteUser(id, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.resetUserPassword(id, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Employers & Workers List helpers
  static async listEmployers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await AdminService.listUsers({
        page,
        limit,
        search,
        role: 'employer',
        status
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async listWorkers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await AdminService.listUsers({
        page,
        limit,
        search,
        role: 'candidate',
        status
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Job management
  static async listJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;
      const status = req.query.status as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'ASC' | 'DESC';

      const result = await AdminService.listJobs({
        page,
        limit,
        search,
        status,
        sortBy,
        sortOrder
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async listPendingJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);

      const result = await AdminService.listJobs({
        page,
        limit,
        status: 'PENDING_REVIEW'
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getJobDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await AdminService.getJobDetails(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async approveJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.approveJob(id, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async rejectJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.rejectJob(id, reason, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unpublishJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.unpublishJob(id, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.deleteJob(id, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Categories CRUD
  static async listCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listCategories();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, icon, status } = req.body;
      const adminId = req.user?.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const data = await AdminService.createCategory(name, icon, status || 'ACTIVE', adminId, ip, ua);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name, icon, status } = req.body;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const data = await AdminService.updateCategory(id, name, icon, status, adminId, ip, ua);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.deleteCategory(id, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Skills CRUD
  static async listSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listSkills();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const data = await AdminService.createSkill(name, adminId, ip, ua);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name, status } = req.body;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const data = await AdminService.updateSkill(id, name, status, adminId, ip, ua);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.deleteSkill(id, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // System settings
  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getSettings();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.updateSettings(req.body, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async broadcastNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.broadcastNotifications(req.body, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Reports
  static async listReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);

      const result = await AdminService.listReports({ page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async resolveReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { action } = req.body;
      const adminId = req.user!.userId;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      const result = await AdminService.resolveReport(id, action, adminId, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Audit logs
  static async listAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;

      const result = await AdminService.listAuditLogs({ page, limit, search });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
