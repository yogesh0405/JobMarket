import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { JobRepository } from '../../../../src/modules/jobs/repositories/JobRepository';
import { UserRepository } from '../../../../src/modules/auth/repositories/UserRepository';
import { EmailService } from '../../../../src/modules/auth/services/EmailService';
import { NotificationService } from '../../../../src/modules/notifications/services/NotificationService';

const isEmployerRole = (r?: string) => {
  const norm = (r || '').toLowerCase().trim();
  return norm === 'employer' || norm === 'admin' || norm === 'recruiter' || norm === 'superadmin' || norm === 'super_admin' || norm === 'company';
};

export class ApplicationController {
  static async getMyAppliedJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const data = await JobRepository.getMyAppliedJobs(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getMyInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const data = await JobRepository.getInterviewsForCandidate(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async applyToJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role || 'candidate';

      if (role !== 'candidate') {
        return res.status(403).json({ success: false, message: 'Access denied: Candidates only' });
      }

      const job = await JobRepository.getJobById(id);
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

      const data = await JobRepository.applyToJob(id, userId);

      (async () => {
        try {
          const [candidate, employer] = await Promise.all([
            UserRepository.findById(userId),
            UserRepository.findById(job.employerId)
          ]);

          if (candidate && employer) {
            await NotificationService.sendNotification(
              employer.id,
              `New Candidate Application`,
              `${candidate.name} applied for "${job.title}"`,
              'JOB_APPLICATION',
              `/dashboard?tab=applicants&jobId=${job.id}`,
              'APPLICATION',
              job.id,
              { jobId: job.id, candidateId: candidate.id }
            ).catch(e => null);

            await NotificationService.sendNotification(
              candidate.id,
              `Application Submitted Successfully`,
              `Your application for "${job.title}" at ${job.company || 'Employer'} has been received.`,
              'APPLICATION_CONFIRMATION',
              `/job/${job.id}`,
              'APPLICATION',
              job.id,
              { jobId: job.id }
            ).catch(e => null);

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
        } catch (e) {}
      })();

      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicantsForJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role;

      if (!employerId || !isEmployerRole(role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Employers only' });
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
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role;

      if (!employerId || !isEmployerRole(role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Employers only' });
      }

      if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

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
            await NotificationService.sendNotification(
              userId,
              `Application Status: ${status.toUpperCase()}`,
              `Your application for "${job.title}" at ${companyName} is now ${status.toUpperCase()}`,
              'JOB_STATUS',
              `/job/${job.id}`,
              'APPLICATION',
              job.id,
              { jobId: job.id, status }
            ).catch(e => null);

            await EmailService.sendApplicationStatusUpdateEmail(
              candidate.email, candidate.name, job.title, companyName, status
            );
          }
        } catch (e) {}
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
      const { interviewDate, interviewTime, venueAddress, interviewLocation, mapsLink } = req.body;
      const finalVenueAddress = venueAddress || interviewLocation || req.body.interviewAddress || 'Industrial Plant Main Gate';
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role;

      if (!employerId || !isEmployerRole(role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Employers only' });
      }

      if (!interviewDate || !interviewTime) {
        return res.status(400).json({ success: false, message: 'Interview date and time are required' });
      }

      const job = await JobRepository.getJobById(id);
      if (!job || job.employerId !== employerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const data = await JobRepository.scheduleInterview(id, userId, employerId, {
        interviewDate, interviewTime, venueAddress: finalVenueAddress, mapsLink
      });

      const [candidate, employer] = await Promise.all([
        UserRepository.findById(userId),
        UserRepository.findById(employerId)
      ]);

      if (candidate && employer) {
        (async () => {
          try {
            await NotificationService.sendNotification(
              userId,
              `Interview Scheduled: ${job.title}`,
              `${employer.company_name || employer.name} scheduled an interview for ${interviewDate} at ${interviewTime} (${finalVenueAddress})`,
              'JOB_INTERVIEW',
              `/job/${job.id}`,
              'INTERVIEW',
              job.id,
              { jobId: job.id, interviewDate, interviewTime, venueAddress: finalVenueAddress }
            ).catch(e => null);

            await EmailService.sendInterviewScheduledEmail(
              candidate.email, candidate.name, job.title, employer.company_name || employer.name,
              interviewDate, interviewTime, finalVenueAddress, mapsLink
            );
          } catch (e) {}
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
      const employerId = req.headers['x-user-id'] as string || req.user?.userId;
      const role = req.headers['x-user-role'] as string || req.user?.role;

      if (!employerId || !isEmployerRole(role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Employers only' });
      }

      if (!subject || !message) {
        return res.status(400).json({ success: false, message: 'Email subject and message body are required' });
      }

      const [candidate, employer, job] = await Promise.all([
        UserRepository.findById(userId),
        UserRepository.findById(employerId),
        JobRepository.getJobById(id)
      ]);

      if (!candidate || !employer || !job) {
        return res.status(404).json({ success: false, message: 'Candidate or Job details not found' });
      }

      await EmailService.sendCustomApplicantEmail(
        candidate.email, candidate.name, employer.company_name || employer.name, job.title, subject, message
      );

      res.status(200).json({ success: true, message: `Email successfully sent to ${candidate.name}` });
    } catch (error) {
      next(error);
    }
  }
}
