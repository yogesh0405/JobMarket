import { apiFetch } from './client';
import { JobApplication, ApiResponse } from '../types';

export const applicantsApi = {
  getApplicantsForJob: async (jobId: string): Promise<ApiResponse<JobApplication[]>> => {
    return apiFetch(`/api/v1/jobs/${jobId}/applicants`);
  },

  updateApplicantStatus: async (jobId: string, userId: string, status: string): Promise<ApiResponse> => {
    return apiFetch(`/api/v1/jobs/${jobId}/applicants/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  scheduleInterview: async (jobId: string, userId: string, interviewData: any): Promise<ApiResponse> => {
    return apiFetch(`/api/v1/jobs/${jobId}/applicants/${userId}/interview`, {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  sendCustomEmail: async (jobId: string, userId: string, emailData: { subject: string; message: string }): Promise<ApiResponse> => {
    return apiFetch(`/api/v1/jobs/${jobId}/applicants/${userId}/email`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  },
};
