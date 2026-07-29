import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { JobRepository } from '../repositories/JobRepository';
import { UserRepository } from '../../auth/repositories/UserRepository';
import { EmailService } from '../../auth/services/EmailService';
import { SupportRepository } from '../../support/repositories/SupportRepository';
import { AdvertisementRepository } from '../../advertisements/repositories/advertisementRepository';
import { CloudinaryUtil } from '../../../utils/cloudinary';
import { AdminRepository } from '../../admin/repositories/AdminRepository';

const isEmployerRole = (r?: string) => {
  const norm = (r || '').toLowerCase().trim();
  return norm === 'employer' || norm === 'admin' || norm === 'recruiter';
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

  // --- MAP & GEOLOCATION CONTROLLER ENDPOINTS ---

  /**
   * GET /api/jobs/map
   * Returns jobs bounded by north, south, east, west parameters + search filters
   */
  static async getMapJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        north,
        south,
        east,
        west,
        search,
        workMode,
        jobType,
        salaryMin,
        salaryMax,
        minExperience,
        maxExperience,
        industry,
        skills,
        featured,
        urgent,
        limit
      } = req.query;

      const params = {
        north: north ? parseFloat(north as string) : undefined,
        south: south ? parseFloat(south as string) : undefined,
        east: east ? parseFloat(east as string) : undefined,
        west: west ? parseFloat(west as string) : undefined,
        search: search ? (search as string) : undefined,
        workMode: workMode ? (workMode as string) : undefined,
        jobType: jobType ? (jobType as string) : undefined,
        salaryMin: salaryMin ? parseInt(salaryMin as string, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax as string, 10) : undefined,
        minExperience: minExperience ? parseInt(minExperience as string, 10) : undefined,
        maxExperience: maxExperience ? parseInt(maxExperience as string, 10) : undefined,
        industry: industry ? (industry as string) : undefined,
        skills: skills ? (skills as string) : undefined,
        featured: featured === 'true',
        urgent: urgent === 'true',
        limit: limit ? parseInt(limit as string, 10) : 500
      };

      const data = await JobRepository.getMapJobs(params);
      res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jobs/nearby
   * Returns jobs within radius (km) of given latitude and longitude
   */
  static async getNearbyJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude, radius, search, workMode, limit } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({ success: false, message: 'Latitude and longitude parameters are required' });
        return;
      }

      const params = {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        radius: radius ? parseFloat(radius as string) : 20,
        search: search ? (search as string) : undefined,
        workMode: workMode ? (workMode as string) : undefined,
        limit: limit ? parseInt(limit as string, 10) : 100
      };

      const data = await JobRepository.getNearbyJobs(params);
      res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/jobs/geocode
   * Triggers manual or batch geocoding for pending/un-geocoded jobs
   */
  static async triggerGeocoding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobRepository.geocodePendingJobs();
      res.status(200).json({ success: true, message: 'Batch geocoding completed', data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/map-analytics
   * Admin portal analytics for job geographical distribution
   */
  static async getAdminMapAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await JobRepository.getAdminMapAnalytics();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getJobById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await JobRepository.getJobById(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getMyJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const data = await JobRepository.getJobsByEmployer(employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      const user = await UserRepository.findById(employerId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Employer not found' });
        return;
      }

      const companyName = user.company_name || user.name;
      const jobData = { ...req.body };

      if (jobData.companyLogo && jobData.companyLogo.startsWith('data:')) {
        const timestamp = Date.now();
        const publicId = `job_logo_${employerId}_${timestamp}`;
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
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      const existingJob = await JobRepository.getJobById(id);
      if (!existingJob) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }

      if (existingJob.employerId !== employerId) {
        res.status(403).json({ success: false, message: 'Access denied: You do not own this job' });
        return;
      }

      const jobData = { ...req.body };

      if (jobData.companyLogo && jobData.companyLogo.startsWith('data:')) {
        if (existingJob.companyLogo && existingJob.companyLogo.startsWith('http')) {
          const oldPublicId = CloudinaryUtil.extractPublicId(existingJob.companyLogo);
          if (oldPublicId) {
            await CloudinaryUtil.deleteImage(oldPublicId).catch((err) => {
              console.error('Failed to delete old job logo:', err);
            });
          }
        }

        const timestamp = Date.now();
        const publicId = `job_logo_${employerId}_${timestamp}`;
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
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      const existingJob = await JobRepository.getJobById(id);
      if (!existingJob) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }

      if (existingJob.employerId !== employerId) {
        res.status(403).json({ success: false, message: 'Access denied: You do not own this job' });
        return;
      }

      if (existingJob.companyLogo && existingJob.companyLogo.startsWith('http')) {
        const publicId = CloudinaryUtil.extractPublicId(existingJob.companyLogo);
        if (publicId) {
          await CloudinaryUtil.deleteImage(publicId).catch((err) => {
            console.error('Failed to delete job logo during deletion:', err);
          });
        }
      }

      await JobRepository.deleteJob(id, employerId);
      res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async applyToJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const role = req.user!.role;

      if (role !== 'candidate') {
        res.status(403).json({ success: false, message: 'Access denied: Candidates only' });
        return;
      }

      const job = await JobRepository.getJobById(id);
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }

      const data = await JobRepository.applyToJob(id, userId);

      (async () => {
        try {
          const [candidate, employer] = await Promise.all([
            UserRepository.findById(userId),
            UserRepository.findById(job.employerId)
          ]);

          if (candidate && employer) {
            await SupportRepository.createNotification({
              user_id: employer.id,
              title: `New Candidate Application`,
              message: `${candidate.name} applied for "${job.title}"`,
              link: `/job/${id}/applicants?applicantId=${candidate.id}`
            });

            await AdvertisementRepository.createNotification(
              employer.id,
              `New Candidate Application`,
              `${candidate.name} applied for "${job.title}"`,
              'JOB_APPLICATION',
              `/job/${id}/applicants?applicantId=${candidate.id}`
            );

            const resumeUrl = candidate.resume && (candidate.resume as any).url ? (candidate.resume as any).url : null;
            await EmailService.sendJobApplicationEmail(
              employer.email,
              employer.name,
              job.title,
              job.company,
              candidate.name,
              candidate.email,
              candidate.phone || 'N/A',
              candidate.trade_specialization || 'N/A',
              candidate.location || 'N/A',
              resumeUrl
            );
          }
        } catch (mailErr) {
          console.error('Failed to send application notifications in background:', mailErr);
        }
      })();

      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicantsForJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      const data = await JobRepository.getApplicantsForJob(id, employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateApplicantStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.params.userId as string;
      const { status } = req.body;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required' });
        return;
      }

      const data = await JobRepository.updateApplicantStatus(id, userId, employerId, status);

      (async () => {
        try {
          const [candidate, employer, job] = await Promise.all([
            UserRepository.findById(userId),
            UserRepository.findById(employerId),
            JobRepository.getJobById(id)
          ]);

          if (candidate && job) {
            const companyName = employer?.company_name || employer?.name || job.company;
            await SupportRepository.createNotification({
              user_id: userId,
              title: `Application Status Updated: ${status.toUpperCase()}`,
              message: `Your application for "${job.title}" at ${companyName} is now ${status.toUpperCase()}`,
              link: `/dashboard?tab=applied`
            });

            await AdvertisementRepository.createNotification(
              userId,
              `Application Status Updated: ${status.toUpperCase()}`,
              `Your application for "${job.title}" at ${companyName} is now ${status.toUpperCase()}`,
              'JOB_STATUS',
              `/dashboard?tab=applied`
            );

            await EmailService.sendApplicationStatusUpdateEmail(
              candidate.email,
              candidate.name,
              job.title,
              companyName,
              status
            );
          }
        } catch (notifErr) {
          console.error('Failed to send status update notification:', notifErr);
        }
      })();

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async scheduleInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.params.userId as string;
      const { interviewDate, interviewTime, venueAddress, mapsLink } = req.body;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      if (!interviewDate || !interviewTime || !venueAddress) {
        res.status(400).json({ success: false, message: 'Date, time, and venue address are required' });
        return;
      }

      const job = await JobRepository.getJobById(id);
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }
      if (job.employerId !== employerId) {
        res.status(403).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const data = await JobRepository.scheduleInterview(id, userId, employerId, {
        interviewDate,
        interviewTime,
        venueAddress,
        mapsLink
      });

      const [candidate, employer] = await Promise.all([
        UserRepository.findById(userId),
        UserRepository.findById(employerId)
      ]);

      if (candidate && employer) {
        (async () => {
          try {
            await SupportRepository.createNotification({
              user_id: userId,
              title: `Interview Scheduled: ${job.title}`,
              message: `${employer.company_name || employer.name} scheduled an interview for ${interviewDate} at ${interviewTime}`,
              link: `/dashboard?tab=applied`
            });

            await AdvertisementRepository.createNotification(
              userId,
              `Interview Scheduled: ${job.title}`,
              `${employer.company_name || employer.name} scheduled an interview for ${interviewDate} at ${interviewTime}`,
              'JOB_INTERVIEW',
              `/dashboard?tab=applied`
            );

            await EmailService.sendInterviewScheduledEmail(
              candidate.email,
              candidate.name,
              job.title,
              employer.company_name || employer.name,
              interviewDate,
              interviewTime,
              venueAddress,
              mapsLink
            );
          } catch (mailErr) {
            console.error('Failed to send interview notifications:', mailErr);
          }
        })();
      }

      res.status(200).json({ success: true, message: 'Interview scheduled and email notification sent', data });
    } catch (error) {
      next(error);
    }
  }

  static async sendCustomEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.params.userId as string;
      const { subject, message } = req.body;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      if (!subject || !message) {
        res.status(400).json({ success: false, message: 'Subject and message are required' });
        return;
      }

      const job = await JobRepository.getJobById(id);
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }
      if (job.employerId !== employerId) {
        res.status(403).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const [candidate, employer] = await Promise.all([
        UserRepository.findById(userId),
        UserRepository.findById(employerId)
      ]);

      if (candidate && employer) {
        (async () => {
          try {
            await EmailService.sendCustomEmployerEmail(
              candidate.email,
              candidate.name,
              subject,
              message,
              employer.company_name || employer.name
            );
          } catch (mailErr) {
            console.error('Failed to send custom email:', mailErr);
          }
        })();
      }

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCandidates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const role = req.user!.role;
      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      const data = await UserRepository.getAllCandidates();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async toggleSaveJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const jobId = req.params.id as string;

      const result = await UserRepository.toggleSaveJob(userId, jobId);
      res.status(200).json({ success: true, isSaved: result.isSaved, message: result.isSaved ? 'Job saved' : 'Job unsaved' });
    } catch (error) {
      next(error);
    }
  }
}
