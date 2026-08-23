import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { JobRepository } from '../repositories/JobRepository';
import { UserRepository } from '../../auth/repositories/UserRepository';
import { EmailService } from '../../auth/services/EmailService';
import { SupportRepository } from '../../support/repositories/SupportRepository';
import { AdvertisementRepository } from '../../advertisements/repositories/advertisementRepository';
import { NotificationService } from '../../notifications/services/NotificationService';
import { CloudinaryUtil } from '../../../utils/cloudinary';
import { AdminRepository } from '../../admin/repositories/AdminRepository';

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

  /**
   * POST /api/v1/jobs/resolve-map-url
   * Resolves Google Maps URLs (including shortened links like maps.app.goo.gl) and extracts latitude/longitude coordinates.
   */
  static async resolveMapUrl(req: any, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const inputUrl = url.trim();
      const { extractCoordinatesFromText } = await import('../../../utils/coordinateExtractor');

      let currentUrl = inputUrl;
      let extracted = extractCoordinatesFromText(currentUrl);

      // Multi-hop redirect resolution for short links like maps.app.goo.gl, goo.gl/maps
      if (!extracted && (inputUrl.includes('goo.gl') || inputUrl.includes('maps.app') || inputUrl.includes('http'))) {
        const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        
        for (let hop = 0; hop < 5; hop++) {
          extracted = extractCoordinatesFromText(currentUrl);
          if (extracted) break;

          try {
            // GET request with manual redirect to capture HTTP 301/302 Location header directly
            const response = await fetch(currentUrl, {
              method: 'GET',
              redirect: 'manual'
            });

            const loc = response.headers.get('location');
            if (loc) {
              currentUrl = loc.startsWith('http') ? loc : new URL(loc, currentUrl).href;
              extracted = extractCoordinatesFromText(currentUrl);
              if (extracted) break;
            } else {
              // If 200 OK without location header, inspect HTML text content
              const htmlText = await response.text();
              extracted = extractCoordinatesFromText(htmlText);
              if (extracted) break;
              break;
            }
          } catch (fetchErr) {
            console.warn(`Redirect hop ${hop} failed for ${currentUrl}:`, fetchErr);
            break;
          }
        }
      }

      if (!extracted) {
        const { geocodeLocationText } = await import('../../../utils/coordinateExtractor');
        extracted = await geocodeLocationText(inputUrl);
        if (!extracted && req.body.city) {
          extracted = await geocodeLocationText(req.body.city);
        }
      }

      if (extracted) {
        return res.status(200).json({
          success: true,
          latitude: extracted.latitude,
          longitude: extracted.longitude,
          accuracy: extracted.accuracy
        });
      }

      return res.status(404).json({
        success: false,
        error: 'Could not extract coordinates from the provided Google Maps link'
      });
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

      // Mandatory Field Validations
      if (!jobData.title || typeof jobData.title !== 'string' || !jobData.title.trim()) {
        res.status(400).json({ success: false, message: 'Job title / role is required' });
        return;
      }
      if (!jobData.description || typeof jobData.description !== 'string' || jobData.description.trim().length < 5) {
        res.status(400).json({ success: false, message: 'A meaningful job description is required' });
        return;
      }
      const openingsVal = Number(jobData.openings);
      if (isNaN(openingsVal) || openingsVal < 1) {
        res.status(400).json({ success: false, message: 'Vacancy count must be at least 1' });
        return;
      }
      const validSkills = Array.isArray(jobData.skills) 
        ? jobData.skills.filter((s: any) => typeof s === 'string' && s.trim()) 
        : (typeof jobData.skills === 'string' ? jobData.skills.split(',').filter(Boolean) : []);
      if (validSkills.length === 0) {
        res.status(400).json({ success: false, message: 'At least one skill is required' });
        return;
      }
      jobData.skills = validSkills;

      if (!jobData.applicationDeadline) {
        res.status(400).json({ success: false, message: 'Application Deadline date is mandatory' });
        return;
      }

      // Numeric Range & Non-Negative Validations
      const minAge = Number(jobData.minAge);
      const maxAge = Number(jobData.maxAge);
      if (!isNaN(minAge) && !isNaN(maxAge)) {
        if (minAge < 0 || maxAge < 0) {
          res.status(400).json({ success: false, message: 'Age values cannot be negative' });
          return;
        }
        if (minAge > maxAge) {
          res.status(400).json({ success: false, message: 'Minimum Age cannot be greater than Maximum Age' });
          return;
        }
      }

      const salaryMin = Number(jobData.salaryMin);
      const salaryMax = Number(jobData.salaryMax);
      if (!isNaN(salaryMin) && !isNaN(salaryMax)) {
        if (salaryMin < 0 || salaryMax < 0) {
          res.status(400).json({ success: false, message: 'Salary amounts cannot be negative' });
          return;
        }
        if (jobData.discloseSalary !== false && salaryMin > 0 && salaryMax > 0 && salaryMin > salaryMax) {
          res.status(400).json({ success: false, message: 'Minimum Salary cannot be greater than Maximum Salary' });
          return;
        }
      }

      const minExp = Number(jobData.minExperience);
      const maxExp = Number(jobData.maxExperience);
      if (!isNaN(minExp) && !isNaN(maxExp)) {
        if (minExp < 0 || maxExp < 0) {
          res.status(400).json({ success: false, message: 'Experience values cannot be negative' });
          return;
        }
        if (jobData.experienceRequired !== false && minExp > maxExp) {
          res.status(400).json({ success: false, message: 'Minimum Experience cannot be greater than Maximum Experience' });
          return;
        }
      }

      const maxApp = Number(jobData.maxApplicants);
      if (!isNaN(maxApp) && maxApp < 0) {
        res.status(400).json({ success: false, message: 'Maximum Applicants Limit cannot be negative' });
        return;
      }

      // Hiring Method Validation & Sanitization
      const hiringMethod = jobData.hiringMethod || 'STANDARD';
      jobData.hiringMethod = hiringMethod;

      if (hiringMethod === 'WALK_IN') {
        jobData.isWalkIn = true;
        if (!jobData.walkInDate || !jobData.interviewAddress || !jobData.walkInStartTime || !jobData.walkInEndTime || !jobData.walkInContactPerson || !jobData.walkInContactNumber) {
          res.status(400).json({ 
            success: false, 
            message: 'Please fill in all mandatory Walk-in Drive details (Date, Start Time, End Time, Venue Address, Contact Person, and Contact Number)' 
          });
          return;
        }
      } else {
        jobData.isWalkIn = false;
        jobData.walkInDate = null;
        jobData.interviewAddress = null;
        jobData.walkInTime = null;
        jobData.walkInStartTime = null;
        jobData.walkInEndTime = null;
        jobData.walkInContactPerson = null;
        jobData.walkInContactNumber = null;
        jobData.walkInDocuments = null;
      }

      // Ensure industry and trade synchronization for database consistency
      if (!jobData.trade && jobData.industry) {
        jobData.trade = jobData.industry;
      } else if (!jobData.industry && jobData.trade) {
        jobData.industry = jobData.trade;
      }

      // Sanitize Conditional Workflows
      if (!jobData.isMidcLocation) {
        jobData.midcZone = null;
      }
      if (!jobData.targetIti) {
        jobData.itiTrade = null;
      }
      if (jobData.experienceRequired === false) {
        jobData.minExperience = 0;
        jobData.maxExperience = 0;
      }
      if (jobData.discloseSalary === false) {
        jobData.salaryMin = 0;
        jobData.salaryMax = 0;
      }

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

      if (jobData.title !== undefined && (!jobData.title || typeof jobData.title !== 'string' || !jobData.title.trim())) {
        res.status(400).json({ success: false, message: 'Job title / role cannot be empty' });
        return;
      }
      if (jobData.description !== undefined && (!jobData.description || typeof jobData.description !== 'string' || jobData.description.trim().length < 5)) {
        res.status(400).json({ success: false, message: 'A meaningful job description is required' });
        return;
      }
      if (jobData.openings !== undefined) {
        const openingsVal = Number(jobData.openings);
        if (isNaN(openingsVal) || openingsVal < 1) {
          res.status(400).json({ success: false, message: 'Vacancy count must be at least 1' });
          return;
        }
      }
      if (jobData.skills !== undefined) {
        const validSkills = Array.isArray(jobData.skills) 
          ? jobData.skills.filter((s: any) => typeof s === 'string' && s.trim()) 
          : (typeof jobData.skills === 'string' ? jobData.skills.split(',').filter(Boolean) : []);
        if (validSkills.length === 0) {
          res.status(400).json({ success: false, message: 'At least one skill is required' });
          return;
        }
        jobData.skills = validSkills;
      }

      // If job was previously rejected, reset status to PENDING for Admin re-evaluation upon employer edit
      if (existingJob.dbStatus === 'REJECTED' || existingJob.status === 'rejected') {
        jobData.status = 'active';
        jobData.dbStatus = 'PENDING';
        jobData.rejectReason = null;
      }

      // Ensure industry and trade synchronization for database consistency
      if (!jobData.trade && jobData.industry) {
        jobData.trade = jobData.industry;
      } else if (!jobData.industry && jobData.trade) {
        jobData.industry = jobData.trade;
      }

      if (jobData.isMidcLocation === false) {
        jobData.midcZone = null;
      }
      if (jobData.targetIti === false) {
        jobData.itiTrade = null;
      }
      if (jobData.experienceRequired === false) {
        jobData.minExperience = 0;
        jobData.maxExperience = 0;
      }
      if (jobData.discloseSalary === false) {
        jobData.salaryMin = 0;
        jobData.salaryMax = 0;
      }

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

  static async getMyAppliedJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await JobRepository.getMyAppliedJobs(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getMySavedJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await JobRepository.getMySavedJobs(userId);
      res.status(200).json({ success: true, data });
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
            // Send in-app notification to Employer
            await NotificationService.sendNotification(
              employer.id,
              `New Candidate Application`,
              `${candidate.name} applied for "${job.title}"`,
              'JOB_APPLICATION',
              `/dashboard?tab=applicants&jobId=${job.id}`,
              'APPLICATION',
              job.id,
              { jobId: job.id, candidateId: candidate.id }
            ).catch(err => console.error('Failed to create employer in-app notification:', err));

            // Send in-app confirmation notification to Candidate
            await NotificationService.sendNotification(
              candidate.id,
              `Application Submitted Successfully`,
              `Your application for "${job.title}" at ${job.company || 'Employer'} has been received.`,
              'APPLICATION_CONFIRMATION',
              `/job/${job.id}`,
              'APPLICATION',
              job.id,
              { jobId: job.id }
            ).catch(err => console.error('Failed to create candidate in-app notification:', err));

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
            await NotificationService.sendNotification(
              userId,
              `Application Status: ${status.toUpperCase()}`,
              `Your application for "${job.title}" at ${companyName} is now ${status.toUpperCase()}`,
              'JOB_STATUS',
              `/job/${job.id}`,
              'APPLICATION',
              job.id,
              { jobId: job.id, status }
            ).catch(err => console.error('Failed to send status in-app notification:', err));

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
      const { interviewDate, interviewTime, venueAddress, interviewLocation, mapsLink } = req.body;
      const finalVenueAddress = venueAddress || interviewLocation || req.body.interviewAddress || 'Industrial Plant Main Gate';
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (!isEmployerRole(role)) {
        res.status(403).json({ success: false, message: 'Access denied: Employers only' });
        return;
      }

      if (!interviewDate || !interviewTime) {
        res.status(400).json({ success: false, message: 'Interview date and time are required' });
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
        venueAddress: finalVenueAddress,
        mapsLink
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
              `${employer.company_name || employer.name} scheduled an interview for ${interviewDate} at ${interviewTime} (${venueAddress})`,
              'JOB_INTERVIEW',
              `/job/${job.id}`,
              'INTERVIEW',
              job.id,
              { jobId: job.id, interviewDate, interviewTime, venueAddress }
            ).catch(err => console.error('Failed to send interview in-app notification:', err));

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

  static async getEmployerAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const analytics = await JobRepository.getEmployerAnalytics(employerId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/jobs/interviews/my-interviews
   * Returns { upcoming: [...], past: [...] } interview schedule for authenticated candidate
   */
  static async getMyInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await JobRepository.getInterviewsForCandidate(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
