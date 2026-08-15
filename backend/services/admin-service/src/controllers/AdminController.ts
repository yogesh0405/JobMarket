import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { AdminService } from '../../../../src/modules/admin/services/AdminService';

export class AdminController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardData();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listUsers(req.query as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await AdminService.getUserDetails(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.updateUserStatus(id, status, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      await AdminService.deleteUser(id, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.resetUserPassword(id, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listEmployers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listUsers({ ...req.query, role: 'employer' } as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listWorkers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listUsers({ ...req.query, role: 'candidate' } as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listJobs(req.query as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listPendingJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listJobs({ ...req.query, status: 'PENDING' } as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getJobDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await AdminService.getJobDetails(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async approveJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.approveJob(id, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async rejectJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.rejectJob(id, reason, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async unpublishJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.unpublishJob(id, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      await AdminService.deleteJob(id, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, message: 'Job deleted' });
    } catch (error) {
      next(error);
    }
  }

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
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.createCategory(name, icon, status, adminId, req.ip, req.headers['user-agent']);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, icon, status } = req.body;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.updateCategory(id, name, icon, status, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      await AdminService.deleteCategory(id, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  }

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
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.createSkill(name, adminId, req.ip, req.headers['user-agent']);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, status } = req.body;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.updateSkill(id, name, status, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      await AdminService.deleteSkill(id, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, message: 'Skill deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async listReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listReports(req.query as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async resolveReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.resolveReport(id, action, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.listAuditLogs(req.query as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getSettings();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.updateSettings(req.body, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async broadcastNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await AdminService.broadcastNotifications(req.body, adminId, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
