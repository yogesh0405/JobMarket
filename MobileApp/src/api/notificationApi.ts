import { apiFetch, isValidId } from './client';
import { ApiResponse } from '../types';

export interface AppNotification {
  id: string;
  user_id?: string;
  userId?: string;
  title: string;
  message: string;
  type?: 'JOB_APPLICATION' | 'JOB_STATUS' | 'JOB_INTERVIEW' | 'JOB_APPROVAL' | 'AD_APPROVED' | 'AD_REJECTED' | 'SUPPORT' | 'SYSTEM' | string;
  read?: boolean;
  is_read?: boolean;
  link?: string;
  created_at?: string;
  createdAt?: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<ApiResponse<AppNotification[]>> => {
    return apiFetch('/api/v1/notifications');
  },

  markAsRead: async (id: string): Promise<ApiResponse> => {
    if (!isValidId(id)) {
      return { success: false, error: 'Invalid Notification ID' } as any;
    }
    return apiFetch(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllAsRead: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/notifications/read-all', {
      method: 'PATCH',
    });
  },

  deleteNotification: async (id: string): Promise<ApiResponse> => {
    if (!isValidId(id)) {
      return { success: false, error: 'Invalid Notification ID' } as any;
    }
    return apiFetch(`/api/v1/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  clearAll: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/notifications/clear-all', {
      method: 'DELETE',
    });
  },
};
