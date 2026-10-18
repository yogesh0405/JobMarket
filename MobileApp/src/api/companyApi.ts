import { apiFetch } from './client';
import { ApiResponse } from '../types';

export interface FollowStatusResponse {
  isFollowing: boolean;
  followersCount: number;
}

export interface ToggleFollowResponse {
  isFollowing: boolean;
  followersCount: number;
  message?: string;
}

export interface FollowedCompany {
  id: string;
  name: string;
  employer_id?: string;
  employerId?: string;
  logo?: string;
  industry?: string;
  city?: string;
  midc_zone?: string;
  verified?: boolean;
  open_jobs_count?: number;
  followed_at?: string;
}

export const formatFollowersCount = (count: number): string => {
  if (!count || count <= 0) return '0 Followers';
  if (count === 1) return '1 Follower';
  if (count < 1000) return `${count} Followers`;
  if (count < 1000000) {
    const formatted = (count / 1000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}K Followers`;
  }
  const formatted = (count / 1000000).toFixed(1).replace(/\.0$/, '');
  return `${formatted}M Followers`;
};

export const companyApi = {
  /**
   * Fetch real-time follower status and exact count
   */
  getFollowStatus: async (companyId: string): Promise<ApiResponse<FollowStatusResponse>> => {
    return apiFetch<ApiResponse<FollowStatusResponse>>(
      `/api/v1/companies/${encodeURIComponent(companyId)}/follow-status`
    );
  },

  /**
   * Toggle follow / unfollow for authenticated user
   */
  toggleFollow: async (companyId: string): Promise<ApiResponse<ToggleFollowResponse>> => {
    return apiFetch<ApiResponse<ToggleFollowResponse>>(
      `/api/v1/companies/${encodeURIComponent(companyId)}/toggle-follow`,
      {
        method: 'POST',
      }
    );
  },

  /**
   * Fetch companies followed by the current user
   */
  getFollowedCompanies: async (): Promise<ApiResponse<FollowedCompany[]>> => {
    return apiFetch<ApiResponse<FollowedCompany[]>>('/api/v1/companies/following/my');
  },
};
