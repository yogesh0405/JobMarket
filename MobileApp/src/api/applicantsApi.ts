import { apiFetch, isValidId } from './client';
import { JobApplication, ApiResponse } from '../types';

export const applicantsApi = {
  getAllApplicants: async (): Promise<ApiResponse<JobApplication[]>> => {
    return apiFetch('/api/v1/jobs/applicants/all');
  },

  getApplicantsForJob: async (jobId?: string): Promise<ApiResponse<JobApplication[]>> => {
    if (!jobId || jobId === 'ALL' || jobId === 'all' || !isValidId(jobId)) {
      return apiFetch('/api/v1/jobs/applicants/all');
    }
    return apiFetch(`/api/v1/jobs/${jobId}/applicants`);
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
