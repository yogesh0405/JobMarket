import { apiFetch, isValidId } from './client';
import { JobApplication, ApiResponse } from '../types';

export const applicantsApi = {
  getAllApplicants: async (): Promise<ApiResponse<JobApplication[]>> => {
    // Try primary endpoint
    try {
      const res = await apiFetch('/api/v1/jobs/applicants/all');
      if (res && (res.success || Array.isArray(res.data) || Array.isArray(res))) {
        return res;
      }
    } catch (_) {}

    // Fallback endpoint 1: /api/v1/jobs/employer/applicants
    try {
      const res2 = await apiFetch('/api/v1/jobs/employer/applicants');
      if (res2 && (res2.success || Array.isArray(res2.data) || Array.isArray(res2))) {
        return res2;
      }
    } catch (_) {}

    // Fallback endpoint 2: /api/v1/jobs/applicants
    try {
      const res3 = await apiFetch('/api/v1/jobs/applicants');
      if (res3 && (res3.success || Array.isArray(res3.data) || Array.isArray(res3))) {
        return res3;
      }
    } catch (_) {}

    return { success: false, data: [] } as any;
  },

  getApplicantsForJob: async (jobId?: string): Promise<ApiResponse<JobApplication[]>> => {
    if (!jobId || jobId === 'ALL' || jobId === 'all' || !isValidId(jobId)) {
      return applicantsApi.getAllApplicants();
    }
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/applicants`);
      if (res && (res.success || Array.isArray(res.data) || Array.isArray(res))) {
        return res;
      }
    } catch (_) {}
    return { success: false, data: [] } as any;
  },

  updateApplicantStatus: async (jobId: string, userId: string, status: string): Promise<ApiResponse> => {
    if (!isValidId(jobId) || !isValidId(userId)) {
      return { success: false, error: 'Invalid Parameters' } as any;
    }
    return apiFetch(`/api/v1/jobs/${jobId}/applicants/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  scheduleInterview: async (jobId: string, userId: string, interviewData: any): Promise<ApiResponse> => {
    if (!isValidId(jobId) || !isValidId(userId)) {
      return { success: false, error: 'Invalid Parameters' } as any;
    }
    return apiFetch(`/api/v1/jobs/${jobId}/applicants/${userId}/interview`, {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  sendCustomEmail: async (jobId: string, userId: string, emailData: { subject: string; message: string }): Promise<ApiResponse> => {
    if (!isValidId(jobId) || !isValidId(userId)) {
      return { success: false, error: 'Invalid Parameters' } as any;
    }
    return apiFetch(`/api/v1/jobs/${jobId}/applicants/${userId}/email`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  },
};
