import { apiFetch, isValidId } from './client';
import { User, ApiResponse } from '../types';
import { getAccessToken } from '../utils/secureStorage';

export const authApi = {
  login: async (credentials: any): Promise<ApiResponse> => {
    const role = credentials?.role || credentials?.authMethod;
    const bodyPayload = role ? { ...credentials, role } : { ...credentials };
    return apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
    });
  },

  googleAuth: async (payload: any): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  signup: async (payload: any): Promise<ApiResponse> => {
    const role = payload?.role || 'candidate';
    return apiFetch('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ role, ...payload }),
    });
  },

  sendOTP: async (email: string, reason?: string): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, reason }),
    });
  },

  verifyOTP: async (email: string, otpCode: string): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  getProfile: async (): Promise<ApiResponse<{ user: User } | User>> => {
    return apiFetch('/api/v1/auth/me');
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (passwords: any): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
  },

  getSessions: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/sessions');
  },

  revokeSession: async (sessionId: string): Promise<ApiResponse> => {
    if (!isValidId(sessionId)) {
      return { success: false, error: 'Invalid Session ID' } as any;
    }
    return apiFetch(`/api/v1/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  logout: async (sessionId: string): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  logoutAll: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/logout-all', {
      method: 'POST',
    });
  },

  toggle2FA: async (enabled?: boolean): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/2fa/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  toggleTwoFactor: async (enabled?: boolean): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/2fa/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  verify2FALogin: async (mfaToken: string, otpCode: string): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify({ mfaToken, otpCode }),
    });
  },

  logoutAllOtherSessions: async (): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/logout-all', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (payload: { email: string; otpCode: string; newPassword: string }): Promise<ApiResponse> => {
    return apiFetch('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        otpCode: payload.otpCode,
        newPassword: payload.newPassword,
      }),
    });
  },
};
