import { apiFetch } from './client';
import { Job, ApiResponse, User } from '../types';

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
    return apiFetch(`/api/v1/jobs/${jobId}/save`, {
      method: 'POST',
    });
  },

  // Submit job application
  applyForJob: async (
    jobId: string,
    payload?: { resumeUrl?: string; coverNote?: string }
  ): Promise<ApiResponse> => {
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

  // Upload candidate profile photo
  uploadProfilePicture: async (base64Image: string): Promise<ApiResponse<{ url: string }>> => {
    return apiFetch('/api/v1/auth/profile/picture', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image }),
    });
  },

  // Remove candidate profile photo
  deleteProfilePicture: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/profile/picture', {
      method: 'DELETE',
    });
  },

  // Upload Resume document
  uploadResume: async (base64Data: string, fileName: string): Promise<ApiResponse<{ url: string }>> => {
    return apiFetch('/api/v1/auth/resume', {
      method: 'POST',
      body: JSON.stringify({ base64: base64Data, file: base64Data, name: fileName, fileName }),
    });
  },

  // Delete uploaded Resume document
  deleteResume: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/resume', {
      method: 'DELETE',
    });
  },

  // Toggle resume search visibility (Public vs Private)
  toggleResumeVisibility: async (isPublic: boolean): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/resume/visibility', {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    });
  },

  // Fetch platform settings (role_tabs_config, etc.)
  getSettings: async (): Promise<ApiResponse<any>> => {
    return apiFetch('/api/v1/settings');
  },
};
