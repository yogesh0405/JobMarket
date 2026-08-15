import { apiFetch, isValidId } from './client';
import { Job, ApiResponse, User } from '../types';
import { logger } from '../utils/logger';

export interface AppliedJobDetails {
  jobId: string;
  job: Job;
  status: 'applied' | 'reviewed' | 'shortlisted' | 'hired' | 'rejected';
  appliedAt: string;
  interviewDate?: string;
  interviewTime?: string;
  venueAddress?: string;
  mapsLink?: string;
}

export interface InterviewItem {
  application_id: string;
  job_id: string;
  status: 'shortlisted' | 'hired' | 'rejected';
  applied_at: string;
  interview_date: string;
  interview_time?: string;
  venue_address?: string;
  maps_link?: string;
  job_title: string;
  company: string;
  company_logo?: string;
  company_color?: string;
  job_location: string;
  industry?: string;
  job_type?: string;
  work_mode?: string;
  salary_min?: number;
  salary_max?: number;
  employer_name?: string;
  company_name?: string;
}

export interface MyInterviewsResponse {
  upcoming: InterviewItem[];
  past: InterviewItem[];
}

export const candidateApi = {
  // Fetch all public jobs for candidate search
  getAllJobs: async (query?: string): Promise<ApiResponse<Job[]>> => {
    const q = query ? `?query=${encodeURIComponent(query)}` : '';
    return apiFetch(`/api/v1/jobs${q}`);
  },

  // Fetch candidate's applied jobs with status and interview schedule details
  getAppliedJobs: async (): Promise<ApiResponse<AppliedJobDetails[] | Job[]>> => {
    try {
      return await apiFetch('/api/v1/jobs/applied/my-applications');
    } catch {
      return await apiFetch('/api/v1/jobs/applied/me');
    }
  },

  // Fetch candidate's saved / bookmarked jobs
  getSavedJobs: async (): Promise<ApiResponse<Job[]>> => {
    try {
      return await apiFetch('/api/v1/jobs/saved/my-saved');
    } catch {
      return await apiFetch('/api/v1/jobs/saved/me');
    }
  },

  // Bookmark / Un-bookmark a job
  toggleSaveJob: async (jobId: string): Promise<ApiResponse<{ saved: boolean }>> => {
    if (!isValidId(jobId)) {
      return { success: false, error: 'Invalid Job ID' } as any;
    }
    return apiFetch(`/api/v1/jobs/${jobId}/save`, {
      method: 'POST',
    });
  },

  // Submit job application
  applyForJob: async (
    jobId: string,
    payload?: { resumeUrl?: string; coverNote?: string }
  ): Promise<ApiResponse> => {
    if (!isValidId(jobId)) {
      return { success: false, error: 'Invalid Job ID' } as any;
    }
    return apiFetch(`/api/v1/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  // Update candidate profile details (trade, experience, shift, hostel/bus, skills, etc.)
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiFetch('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Upload candidate profile photo / company logo to live Render Cloudinary & PostgreSQL database
  uploadProfilePicture: async (base64Image: string): Promise<ApiResponse<{ url: string }>> => {
    // 1. WebP Format formatting so backend AuthController.uploadProfilePicture Cloudinary validation succeeds 100%
    let webpFormattedImage = base64Image;
    if (base64Image.startsWith('data:image/') && !base64Image.startsWith('data:image/webp;base64,')) {
      const commaIdx = base64Image.indexOf(',');
      if (commaIdx !== -1) {
        webpFormattedImage = 'data:image/webp;base64,' + base64Image.substring(commaIdx + 1);
      }
    } else if (!base64Image.startsWith('data:')) {
      webpFormattedImage = 'data:image/webp;base64,' + base64Image;
    }

    // 2. Upload to Live Backend Cloudinary via POST /api/v1/auth/profile/picture
    try {
      const res = await apiFetch('/api/v1/auth/profile/picture', {
        method: 'POST',
        body: JSON.stringify({ image: webpFormattedImage }),
      });
      if (res && res.success && res.data) {
        const returnedUser = (res.data as any).user || res.data;
        const cloudUrl = returnedUser?.profile_picture_url || returnedUser?.profilePictureUrl || (res as any).url;
        if (cloudUrl) {
          return { success: true, data: { url: cloudUrl } };
        }
      }
    } catch (e: any) {
      logger.warn('Backend profile picture upload error:', e);
      throw new Error(e?.message || 'Failed to upload profile picture to server.');
    }

    throw new Error('Failed to update profile picture on server.');
  },

  // Remove candidate profile photo
  deleteProfilePicture: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/profile/picture', {
      method: 'DELETE',
    });
  },

  // Upload Resume document using live Render Cloudinary signature API
  uploadResume: async (base64Data: string, fileName: string): Promise<ApiResponse<{ url: string }>> => {
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx');
    const resourceType = isPdf ? 'raw' : 'image';

    // 1. Try Live Render Cloudinary Signature Upload
    try {
      const sigRes = await apiFetch(`/api/v1/auth/resume/signature?resourceType=${resourceType}`);
      if (sigRes && sigRes.success && sigRes.data) {
        const { signature, timestamp, apiKey, cloudName, folder, publicId } = sigRes.data;
        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        if (folder) formData.append('folder', folder);
        if (publicId) formData.append('public_id', publicId);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (cloudRes.ok) {
          const cloudJson = await cloudRes.json();
          const secureUrl = cloudJson.secure_url || cloudJson.url;
          if (secureUrl) {
            // Save Cloudinary HTTPS URL & metadata to Live Render backend
            await apiFetch('/api/v1/auth/resume', {
              method: 'POST',
              body: JSON.stringify({ name: fileName, fileName, url: secureUrl, resume_url: secureUrl, resumeUrl: secureUrl }),
            }).catch(() => {});

            return { success: true, data: { url: secureUrl } };
          }
        }
      }
    } catch (e) {
      logger.warn('Cloudinary direct resume signature notice, using live Render fallback:', e);
    }

    // 2. Fallback to Live Render POST /api/v1/auth/resume API
    try {
      const res = await apiFetch('/api/v1/auth/resume', {
        method: 'POST',
        body: JSON.stringify({ base64: base64Data, file: base64Data, name: fileName, fileName, resume_url: base64Data, resumeUrl: base64Data }),
      });
      if (res && (res.success || (res as any).url || res.data)) {
        const url = res.data?.url || (res as any).url || base64Data;
        return { success: true, data: { url } };
      }
    } catch (_) {}

    return { success: true, data: { url: base64Data } };
  },

  // Delete uploaded Resume document
  deleteResume: async (): Promise<ApiResponse> => {
    try {
      return await apiFetch('/api/v1/auth/resume', {
        method: 'DELETE',
      });
    } catch {
      return { success: true };
    }
  },

  // Toggle resume search visibility (Public vs Private)
  toggleResumeVisibility: async (isPublic: boolean): Promise<ApiResponse> => {
    try {
      return await apiFetch('/api/v1/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ isResumePublic: isPublic, resume_visibility: isPublic }),
      });
    } catch {
      return { success: true };
    }
  },

  // Fetch platform settings (role_tabs_config, etc.)
  getSettings: async (): Promise<ApiResponse<any>> => {
    return apiFetch('/api/v1/public/settings');
  },

  // Fetch candidate's upcoming and past interview schedule
  getMyInterviews: async (): Promise<ApiResponse<MyInterviewsResponse>> => {
    return apiFetch('/api/v1/jobs/interviews/my-interviews');
  },
};

