import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { JobRepository } from '../repositories/JobRepository';
import { UserRepository } from '../../auth/repositories/UserRepository';
import { EmailService } from '../../auth/services/EmailService';
import { SupportRepository } from '../../support/repositories/SupportRepository';
import { AdvertisementRepository } from '../../advertisements/repositories/advertisementRepository';
import { CloudinaryUtil } from '../../../utils/cloudinary';

import { AdminRepository } from '../../admin/repositories/AdminRepository';

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

      if (role !== 'employer') {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      // Fetch employer to get their company name
      const user = await UserRepository.findById(employerId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Employer not found' });
        return;
      }

      const companyName = user.company_name || user.name;
      const jobData = { ...req.body };

      // Handle logo upload
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

      if (role !== 'employer') {
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

      // Handle logo upload & cleanup
      if (jobData.companyLogo && jobData.companyLogo.startsWith('data:')) {
        // Delete old logo if exists
        if (existingJob.companyLogo && existingJob.companyLogo.startsWith('http')) {
          const oldPublicId = CloudinaryUtil.extractPublicId(existingJob.companyLogo);
          if (oldPublicId) {
            await CloudinaryUtil.deleteImage(oldPublicId).catch(err => {
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

      if (role !== 'employer') {
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

      // Cleanup logo asset
      if (existingJob.companyLogo && existingJob.companyLogo.startsWith('http')) {
        const publicId = CloudinaryUtil.extractPublicId(existingJob.companyLogo);
        if (publicId) {
          await CloudinaryUtil.deleteImage(publicId).catch(err => {
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

      // Dispatch in-app notification & email to employer in background
      (async () => {
        try {
          const [candidate, employer] = await Promise.all([
            UserRepository.findById(userId),
            UserRepository.findById(job.employerId)
          ]);

          if (candidate && employer) {
            // 1. In-app notification for employer deep-linked to candidate page
            await SupportRepository.createNotification({
              user_id: employer.id,
              title: `New Candidate Application`,
              message: `${candidate.name} applied for "${job.title}"`,
              link: `/job/${id}/applicants?applicantId=${candidate.id}`
            });

            // 1b. Header Bell Notification Table Entry
            await AdvertisementRepository.createNotification(
              employer.id,
              `New Candidate Application`,
              `${candidate.name} applied for "${job.title}"`,
              'JOB_APPLICATION',
              `/job/${id}/applicants?applicantId=${candidate.id}`
            );

            // 2. Email notification for employer
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

      if (role !== 'employer') {
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

      if (role !== 'employer') {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required' });
        return;
      }

      const data = await JobRepository.updateApplicantStatus(id, userId, employerId, status);

      // Dispatch in-app and email notifications to candidate on status update
      (async () => {
        try {
          const [candidate, employer, job] = await Promise.all([
            UserRepository.findById(userId),
            UserRepository.findById(employerId),
            JobRepository.getJobById(id)
          ]);

          if (candidate && job) {
            const companyName = employer?.company_name || employer?.name || job.company;
            // 1. In-app notification
            await SupportRepository.createNotification({
              user_id: userId,
              title: `Application Status Updated: ${status.toUpperCase()}`,
              message: `Your application for "${job.title}" at ${companyName} is now ${status.toUpperCase()}`,
              link: `/dashboard?tab=applied`
            });

            // 1b. Header Bell Notification Table Entry
            await AdvertisementRepository.createNotification(
              userId,
              `Application Status Updated: ${status.toUpperCase()}`,
              `Your application for "${job.title}" at ${companyName} is now ${status.toUpperCase()}`,
              'JOB_STATUS',
              `/dashboard?tab=applied`
            );

            // 2. Email notification
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

      if (role !== 'employer') {
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
            // 1. In-app notification for candidate with interview details link
            await SupportRepository.createNotification({
              user_id: userId,
              title: `Interview Scheduled: ${job.title}`,
              message: `${employer.company_name || employer.name} scheduled an interview for ${interviewDate} at ${interviewTime}`,
              link: `/dashboard?tab=applied`
            });

            // 1b. Header Bell Notification Table Entry
            await AdvertisementRepository.createNotification(
              userId,
              `Interview Scheduled: ${job.title}`,
              `${employer.company_name || employer.name} scheduled an interview for ${interviewDate} at ${interviewTime}`,
              'JOB_INTERVIEW',
              `/dashboard?tab=applied`
            );

            // 2. Email notification
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

      if (role !== 'employer') {
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
      if (role !== 'employer') {
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
