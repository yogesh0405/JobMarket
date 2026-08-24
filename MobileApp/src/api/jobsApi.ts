import { apiFetch, isValidId } from './client';
import { Job, ApiResponse } from '../types';

export const jobsApi = {
  getMyJobs: async (): Promise<ApiResponse<Job[]>> => {
    return apiFetch('/api/v1/jobs/my-jobs/all');
  },

  getJobById: async (id: string): Promise<ApiResponse<Job>> => {
    if (!isValidId(id)) {
      return { success: false, error: 'Invalid Job ID' } as any;
    }
    return apiFetch(`/api/v1/jobs/${id}`);
  },

  createJob: async (jobData: Partial<Job>): Promise<ApiResponse<Job>> => {
    return apiFetch('/api/v1/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  updateJob: async (id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> => {
    if (!isValidId(id)) {
      return { success: false, error: 'Invalid Job ID' } as any;
    }
    return apiFetch(`/api/v1/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  deleteJob: async (id: string): Promise<ApiResponse> => {
    if (!isValidId(id)) {
      return { success: false, error: 'Invalid Job ID' } as any;
    }
    return apiFetch(`/api/v1/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  resolveMapUrl: async (
    url: string,
    extra?: { location?: string; city?: string; midcZone?: string }
  ): Promise<ApiResponse<{ latitude?: number; longitude?: number; formattedAddress?: string }>> => {
    return apiFetch('/api/v1/jobs/resolve-map-url', {
      method: 'POST',
      body: JSON.stringify({
        url,
        location: extra?.location,
        city: extra?.city,
        midcZone: extra?.midcZone,
      }),
    });
  },

  getCategories: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/jobs/meta/categories');
  },

  getSkills: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/jobs/meta/skills');
  },
};
