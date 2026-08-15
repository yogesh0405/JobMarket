import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { JobRepository } from '../../../../src/modules/jobs/repositories/JobRepository';
import { UserRepository } from '../../../../src/modules/auth/repositories/UserRepository';
import { AdminRepository } from '../../../../src/modules/admin/repositories/AdminRepository';
import { CloudinaryUtil } from '../../../../shared/utils/cloudinary';

const isEmployerRole = (r?: string) => {
  const norm = (r || '').toLowerCase().trim();
  return norm === 'employer' || norm === 'admin' || norm === 'recruiter' || norm === 'superadmin' || norm === 'super_admin' || norm === 'company';
};

export class JobController {
  static async getCategories(req: any, res: Response, next: NextFunction) {
    try {
      const data = await AdminRepository.getCategories();
      const activeOnly = data.filter((c: any) => c.status === 'ACTIVE' || !c.status);
      res.status(200).json({ success: true, data: activeOnly });
    } catch (error) {
      next(error);
    }
  }

  static async getSkills(req: any, res: Response, next: NextFunction) {
    try {
      const data = await AdminRepository.getSkills();
      const activeOnly = data.filter((s: any) => s.status === 'ACTIVE' || !s.status);
      res.status(200).json({ success: true, data: activeOnly });
    } catch (error) {
      next(error);
    }
  }

  static async getJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await JobRepository.getJobs();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getJobById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await JobRepository.getJobById(id);
      if (!data) return res.status(404).json({ success: false, message: 'Job not found' });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getMyJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!employerId) return res.status(401).json({ error: 'Unauthorized' });
      const data = await JobRepository.getJobsByEmployer(employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role;
      if (!employerId || !isEmployerRole(role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Employers only' });
      }

      const user = await UserRepository.findById(employerId);
      if (!user) return res.status(404).json({ success: false, message: 'Employer not found' });

      const companyName = user.company_name || user.name;
      const jobData = { ...req.body };

      if (!jobData.title || typeof jobData.title !== 'string' || !jobData.title.trim()) {
        return res.status(400).json({ success: false, message: 'Job title / role is required' });
      }

      if (jobData.companyLogo && jobData.companyLogo.startsWith('data:')) {
        const publicId = `job_logo_${employerId}_${Date.now()}`;
        const cloudinaryUrl = await CloudinaryUtil.uploadImage(jobData.companyLogo, 'job_logos', publicId);
        jobData.companyLogo = cloudinaryUrl;
      }

      const data = await JobRepository.createJob(employerId, companyName, jobData);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role;

      if (!employerId || !isEmployerRole(role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Employers only' });
      }

      const existingJob = await JobRepository.getJobById(id);
      if (!existingJob) return res.status(404).json({ success: false, message: 'Job not found' });
      if (existingJob.employerId !== employerId) {
        return res.status(403).json({ success: false, message: 'Access denied: You do not own this job' });
      }

      const jobData = { ...req.body };

      if (jobData.companyLogo && jobData.companyLogo.startsWith('data:')) {
        const publicId = `job_logo_${employerId}_${Date.now()}`;
        const cloudinaryUrl = await CloudinaryUtil.uploadImage(jobData.companyLogo, 'job_logos', publicId);
        jobData.companyLogo = cloudinaryUrl;
      }

      const data = await JobRepository.updateJob(id, employerId, jobData);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role;

      if (!employerId || !isEmployerRole(role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Employers only' });
      }

      const existingJob = await JobRepository.getJobById(id);
      if (!existingJob) return res.status(404).json({ success: false, message: 'Job not found' });
      if (existingJob.employerId !== employerId) {
        return res.status(403).json({ success: false, message: 'Access denied: You do not own this job' });
      }

      await JobRepository.deleteJob(id, employerId);
      res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getMySavedJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const data = await JobRepository.getMySavedJobs(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async toggleSaveJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const data = await UserRepository.toggleSaveJob(userId, id);
      res.status(200).json({
        success: true,
        data: {
          saved: data.isSaved,
          isSaved: data.isSaved
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMapJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await JobRepository.getMapJobs(req.query as any);
      res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  static async getNearbyJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude } = req.query;
      if (!latitude || !longitude) {
        return res.status(400).json({ success: false, message: 'Latitude and longitude parameters are required' });
      }
      const data = await JobRepository.getNearbyJobs({
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        radius: req.query.radius ? parseFloat(req.query.radius as string) : 20
      });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  static async triggerGeocoding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobRepository.geocodePendingJobs();
      res.status(200).json({ success: true, message: 'Batch geocoding completed', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async resolveMapUrl(req: any, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL parameter is required' });
      const { extractCoordinatesFromText } = await import('../../../../src/utils/coordinateExtractor');
      const extracted = extractCoordinatesFromText(url);
      if (extracted) {
        return res.status(200).json({ success: true, latitude: extracted.latitude, longitude: extracted.longitude });
      }
      return res.status(404).json({ success: false, error: 'Could not extract coordinates' });
    } catch (error) {
      next(error);
    }
  }

  static async getEmployerAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await JobRepository.getEmployerAnalytics(employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCandidates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await UserRepository.getAllCandidates();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
