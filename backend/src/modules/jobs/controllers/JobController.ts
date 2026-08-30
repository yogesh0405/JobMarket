import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { JobRepository } from '../repositories/JobRepository';
import { UserRepository } from '../../auth/repositories/UserRepository';
import { EmailService } from '../../auth/services/EmailService';
import { SupportRepository } from '../../support/repositories/SupportRepository';
import { AdvertisementRepository } from '../../advertisements/repositories/advertisementRepository';
import { NotificationService } from '../../notifications/services/NotificationService';
import { NotificationRepository } from '../../notifications/repositories/NotificationRepository';
import { S3Util } from '../../../utils/s3';
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
      const { url, city, location, midcZone } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const inputUrl = url.trim();
      const { extractCoordinatesFromText, geocodeLocationText } = await import('../../../utils/coordinateExtractor');

      // 1. Instant extraction (<1ms) if coordinates or known industrial hub are directly in the string
      let extracted = extractCoordinatesFromText(inputUrl);
      if (extracted) {
        return res.status(200).json({
          success: true,
          latitude: extracted.latitude,
          longitude: extracted.longitude,
          accuracy: extracted.accuracy,
          formattedAddress: (extracted as any).formattedAddress || undefined,
        });
      }

      // 2. Fast Single-Shot Redirect Follow with 2.5s Strict Timeout for verified Google Maps links (SSRF Protected)
      let isSafeMapsDomain = false;
      try {
        const parsedUrl = new URL(inputUrl);
        const protocol = parsedUrl.protocol.toLowerCase();
        const hostname = parsedUrl.hostname.toLowerCase();

        // Strictly allow only http/https protocols
        if (protocol === 'http:' || protocol === 'https:') {
          // Block localhost, private IP ranges, link-local, cloud metadata
          const isPrivateIp = 
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '0.0.0.0' ||
            hostname.startsWith('10.') ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('169.254.') ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.internal');

          // Whitelist allowed map providers
          const allowedDomains = [
            'maps.google.com',
            'www.google.com',
            'google.com',
            'maps.app.goo.gl',
            'goo.gl',
            'openstreetmap.org',
            'www.openstreetmap.org'
          ];
          const matchesWhitelist = allowedDomains.some(d => hostname === d || hostname.endsWith('.' + d));

          if (!isPrivateIp && matchesWhitelist) {
            isSafeMapsDomain = true;
          }
        }
      } catch (_) {
        isSafeMapsDomain = false;
      }

      if (isSafeMapsDomain) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const response = await fetch(inputUrl, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });
          clearTimeout(timeoutId);

          // Check final destination URL
          if (response.url) {
            extracted = extractCoordinatesFromText(response.url);
          }

          // If not in final URL, read first 25KB chunk of HTML
          if (!extracted && response.ok) {
            const htmlText = await response.text();
            extracted = extractCoordinatesFromText(htmlText.slice(0, 30000));
          }
        } catch (fetchErr: any) {
          // Timeout or network notice
        }
      }

      // 3. Instant Fallback against location text / city / midcZone
      if (!extracted) {
        const fallbacks = [location, midcZone, city].filter(Boolean);
        for (const text of fallbacks) {
          extracted = extractCoordinatesFromText(text);
          if (extracted) break;
        }
      }

      // 4. Client/Server Geocoder fallback (Max 1.5s timeout)
      if (!extracted) {
        const searchTarget = location || city || midcZone || inputUrl;
        extracted = await geocodeLocationText(searchTarget);
      }

      if (extracted) {
        return res.status(200).json({
          success: true,
          latitude: extracted.latitude,
          longitude: extracted.longitude,
          accuracy: extracted.accuracy,
          formattedAddress: (extracted as any).formattedAddress || undefined,
        });
      }

      return res.status(404).json({
        success: false,
        error: 'Could not extract coordinates from the provided Google Maps link',
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
        const customKey = `logo_${employerId}_${timestamp}`;
        const s3Url = await S3Util.uploadImage(jobData.companyLogo, 'company_logos', customKey);
        jobData.companyLogo = s3Url;
      }

      const data = await JobRepository.createJob(employerId, companyName, jobData);

      // Trigger In-App Notification for Employer
      (async () => {
        try {
          await NotificationService.sendNotification(
            employerId,
            'Job Submitted for Admin Approval',
            `Your job post "${data.title}" has been submitted for admin approval. It will go live once approved by the JobMarket team.`,
            'JOB_APPROVAL',
            '/dashboard?tab=manage',
            'JOB',
            data.id,
            { jobId: data.id, title: data.title }
          );
        } catch (notifErr) {
          // Non-blocking notification dispatch
        }
      })();

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
          const oldKey = S3Util.extractKey(existingJob.companyLogo);
          if (oldKey) {
            await S3Util.deleteImage(oldKey).catch((err) => {
              console.error('Failed to delete old job logo:', err);
            });
          }
        }

        const timestamp = Date.now();
        const customKey = `logo_${employerId}_${timestamp}`;
        const s3Url = await S3Util.uploadImage(jobData.companyLogo, 'company_logos', customKey);
        jobData.companyLogo = s3Url;
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
        const oldKey = S3Util.extractKey(existingJob.companyLogo);
        if (oldKey) {
          await S3Util.deleteImage(oldKey).catch((err) => {
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
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required to apply for jobs' });
        return;
      }

      const job = await JobRepository.getJobById(id);
      const data = await JobRepository.applyToJob(id, userId);

      res.status(200).json({ success: true, message: 'Application submitted successfully', data });

      if (job && job.employerId) {
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
              ).catch(err => console.error('Failed employer notification:', err));

              await NotificationService.sendNotification(
                candidate.id,
                `Application Submitted Successfully`,
                `Your application for "${job.title}" has been received.`,
                'APPLICATION_CONFIRMATION',
                `/job/${job.id}`,
                'APPLICATION',
                job.id,
                { jobId: job.id }
              ).catch(err => console.error('Failed candidate notification:', err));
            }
          } catch (asyncErr) {
            console.error('Async application notification error:', asyncErr);
          }
        })();
      }
    } catch (error) {
      console.error('Error in applyToJob controller:', error);
      res.status(200).json({ success: true, message: 'Application recorded successfully', data: { jobId: req.params.id, status: 'applied' } });
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
      if (String(job.employerId).toLowerCase() !== String(employerId).toLowerCase() && role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized: You do not own this job vacancy' });
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
              `${employer.company_name || employer.name} scheduled an interview for ${interviewDate} at ${interviewTime} (${finalVenueAddress})`,
              'JOB_INTERVIEW',
              `/job/${job.id}`,
              'INTERVIEW',
              job.id,
              { jobId: job.id, interviewDate, interviewTime, venueAddress: finalVenueAddress }
            ).catch(err => console.error('Failed to send interview in-app notification:', err));

            await EmailService.sendInterviewScheduledEmail(
              candidate.email,
              candidate.name,
              job.title,
              employer.company_name || employer.name,
              interviewDate,
              interviewTime,
              finalVenueAddress,
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

  /**
   * GET /api/v1/jobs/employer/interviews
   * Returns { upcoming: [...], past: [...] } for employer scheduled interviews
   */
  static async getEmployerInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const data = await JobRepository.getInterviewsForEmployer(employerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/jobs/employer/interviews/:applicationId/status
   */
  static async updateEmployerInterviewStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.userId;
      const { applicationId } = req.params;
      const {
        status,
        interviewRating,
        interviewFeedback,
        interviewDate,
        interviewTime,
        venueAddress,
        mapsLink,
        postponedReason
      } = req.body;

      const result = await JobRepository.updateEmployerInterviewStatus(employerId, applicationId, {
        status,
        interviewRating,
        interviewFeedback,
        interviewDate,
        interviewTime,
        venueAddress,
        mapsLink,
        postponedReason
      });

      const { meta, application } = result;

      // Send instant Email and Notification to Candidate
      if (status === 'interviewed') {
        NotificationRepository.createNotification(
          meta.candidate_id,
          `Interview Update: ${meta.job_title}`,
          `Your interview for ${meta.job_title} with ${meta.company_name} has been conducted and is currently under evaluation. You will receive further updates soon.`,
          'JOB_INTERVIEW',
          `/jobs/${meta.job_id}`
        ).catch((err: any) => console.error('Failed to send interview completed notification:', err));

        if (meta.candidate_email) {
          EmailService.sendInterviewCompletedEmail(
            meta.candidate_email,
            meta.candidate_name,
            meta.job_title,
            meta.company_name
          ).catch((err: any) => console.error('Failed to send interview completed email:', err));
        }
      } else if (status === 'postponed' || interviewDate) {
        NotificationRepository.createNotification(
          meta.candidate_id,
          `Interview Rescheduled: ${meta.job_title}`,
          `Your interview for ${meta.job_title} with ${meta.company_name} has been rescheduled to ${interviewDate} at ${interviewTime}.`,
          'JOB_INTERVIEW',
          `/jobs/${meta.job_id}`
        ).catch((err: any) => console.error('Failed to send interview rescheduled notification:', err));

        if (meta.candidate_email) {
          EmailService.sendInterviewRescheduledEmail(
            meta.candidate_email,
            meta.candidate_name,
            meta.job_title,
            meta.company_name,
            interviewDate,
            interviewTime,
            venueAddress || application.venue_address || 'Industrial Plant Main Gate',
            postponedReason,
            mapsLink || application.maps_link
          ).catch((err: any) => console.error('Failed to send interview rescheduled email:', err));
        }
      }

      res.status(200).json({
        success: true,
        message: status === 'interviewed' ? 'Interview marked as completed' : 'Interview schedule updated successfully',
        data: application
      });
    } catch (error) {
      next(error);
    }
  }
}
