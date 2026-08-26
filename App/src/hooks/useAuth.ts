import { useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { User, UserRole } from '../types';
import { apiFetch } from '../utils/api';

const parseArrayField = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const parseResumeField = (val: any): any => {
  if (!val) return null;
  if (typeof val === 'object' && val !== null) return val;
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    } catch (_) {
      return { url: val, name: 'Candidate_Resume.pdf' };
    }
  }
  return null;
};

const normalizeProfilePicture = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    if (typeof val.url === 'string') return val.url;
    if (typeof val.secure_url === 'string') return val.secure_url;
  }
  return '';
};

export const useAuth = () => {
  const { state, dispatch } = useStore();

  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch({ type: 'LOGOUT' });
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [dispatch]);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      const response = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || data.message || 'Login failed';
        if (data.errors && data.errors.length > 0) {
          if (typeof data.errors[0] === 'object' && data.errors[0].message) {
            errorMessage = data.errors[0].message;
          } else if (typeof data.errors[0] === 'string') {
            errorMessage = data.errors[0];
          }
        }
        return { success: false, error: errorMessage };
      }

      if (data.data && data.data.require2FA) {
        return {
          success: true,
          require2FA: true,
          mfaToken: data.data.mfaToken,
          email: data.data.email,
          message: data.data.message
        };
      }

      const { accessToken, refreshToken, sessionId, user: apiUser } = data.data;

      // Persist tokens for subsequent authenticated requests
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (sessionId) {
        localStorage.setItem('sessionId', sessionId);
      }

      // Map the backend user shape to the frontend User type
      const user: User = {
        id: apiUser.id,
        name: typeof apiUser.name === 'string' ? apiUser.name : '',
        email: apiUser.email || '',
        role: apiUser.role as UserRole,
        phone: apiUser.phone || '',
        profilePictureUrl: normalizeProfilePicture(apiUser.profile_picture_url || apiUser.profilePictureUrl || apiUser.avatar_url || apiUser.avatar),
        createdAt: apiUser.created_at || new Date().toISOString(),
        profileComplete: !!apiUser.headline || !!apiUser.trade_specialization,
        resume: parseResumeField(apiUser.resume),
        experience: parseArrayField(apiUser.experience),
        education: parseArrayField(apiUser.education),
        skills: parseArrayField(apiUser.skills),
        savedJobs: parseArrayField(apiUser.savedJobs || apiUser.saved_jobs),
        appliedJobs: parseArrayField(apiUser.appliedJobs || apiUser.applied_jobs),
        appliedJobsWithStatus: parseArrayField(apiUser.appliedJobsWithStatus || apiUser.applied_jobs_with_status),
        headline: apiUser.headline || '',
        location: apiUser.location || '',
        tradeSpecialization: apiUser.trade_specialization || '',
        preferredShift: apiUser.preferred_shift || '',
        requiresBus: !!apiUser.requires_bus,
        requiresAccommodation: !!apiUser.requires_accommodation,
        isResumePublic: apiUser.is_resume_public !== false,
        companyName: apiUser.company_name || '',
        gstNumber: apiUser.gst_number || '',
      };

      dispatch({ type: 'LOGIN', payload: user });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  }, [dispatch]);

  const verify2FALogin = useCallback(async (mfaToken: string, otpCode: string) => {
    try {
      const response = await apiFetch('/api/v1/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || data.message || '2FA Verification failed';
        return { success: false, error: errorMessage };
      }

      const { accessToken, refreshToken, sessionId, user: apiUser } = data.data || data;

      // Persist tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (sessionId) {
        localStorage.setItem('sessionId', sessionId);
      }

      const user: User = {
        id: apiUser.id,
        name: typeof apiUser.name === 'string' ? apiUser.name : '',
        email: apiUser.email || '',
        role: apiUser.role as UserRole,
        phone: apiUser.phone || '',
        profilePictureUrl: normalizeProfilePicture(apiUser.profile_picture_url || apiUser.profilePictureUrl || apiUser.avatar_url || apiUser.avatar),
        createdAt: apiUser.created_at || new Date().toISOString(),
        profileComplete: !!apiUser.headline || !!apiUser.trade_specialization,
        resume: parseResumeField(apiUser.resume),
        experience: parseArrayField(apiUser.experience),
        education: parseArrayField(apiUser.education),
        skills: parseArrayField(apiUser.skills),
        savedJobs: parseArrayField(apiUser.savedJobs || apiUser.saved_jobs),
        appliedJobs: parseArrayField(apiUser.appliedJobs || apiUser.applied_jobs),
        appliedJobsWithStatus: parseArrayField(apiUser.appliedJobsWithStatus || apiUser.applied_jobs_with_status),
        headline: apiUser.headline || '',
        location: apiUser.location || '',
        tradeSpecialization: apiUser.trade_specialization || '',
        preferredShift: apiUser.preferred_shift || '',
        requiresBus: !!apiUser.requires_bus,
        requiresAccommodation: !!apiUser.requires_accommodation,
        isResumePublic: apiUser.is_resume_public !== false,
        companyName: apiUser.company_name || '',
        gstNumber: apiUser.gst_number || '',
      };

      dispatch({ type: 'LOGIN', payload: user });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Network error during 2FA verification. Please try again.' };
    }
  }, [dispatch]);

  const signup = useCallback(async (userData: any) => {
    try {
      const response = await apiFetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || 'Signup failed';
        if (data.errors && data.errors.length > 0) {
          if (typeof data.errors[0] === 'object' && data.errors[0].message) {
            errorMessage = data.errors[0].message;
          } else {
            errorMessage = data.errors[0];
          }
        }
        return { success: false, error: errorMessage };
      }

      const { email } = data.data;

      return { success: true, user: null, email };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    try {
      const response = await apiFetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || data.message || 'Verification failed';
        if (data.errors && data.errors.length > 0) {
          if (typeof data.errors[0] === 'object' && data.errors[0].message) {
            errorMessage = data.errors[0].message;
          } else if (typeof data.errors[0] === 'string') {
            errorMessage = data.errors[0];
          }
        }
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      const response = await apiFetch('/api/v1/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || data.message || 'Failed to update profile.' };
      }

      const apiUser = data.data;
      const user: User = {
        id: apiUser.id,
        name: typeof apiUser.name === 'string' ? apiUser.name : '',
        email: apiUser.email || '',
        role: apiUser.role as UserRole,
        phone: apiUser.phone || '',
        profilePictureUrl: normalizeProfilePicture(apiUser.profile_picture_url || apiUser.profilePictureUrl || apiUser.avatar_url || apiUser.avatar),
        createdAt: apiUser.created_at || new Date().toISOString(),
        profileComplete: !!apiUser.headline || !!apiUser.trade_specialization,
        resume: parseResumeField(apiUser.resume),
        experience: parseArrayField(apiUser.experience),
        education: parseArrayField(apiUser.education),
        skills: parseArrayField(apiUser.skills),
        savedJobs: parseArrayField(apiUser.savedJobs || apiUser.saved_jobs || state.currentUser?.savedJobs),
        appliedJobs: parseArrayField(apiUser.appliedJobs || apiUser.applied_jobs || state.currentUser?.appliedJobs),
        appliedJobsWithStatus: parseArrayField(apiUser.appliedJobsWithStatus || apiUser.applied_jobs_with_status || state.currentUser?.appliedJobsWithStatus),
        headline: apiUser.headline || '',
        location: apiUser.location || '',
        tradeSpecialization: apiUser.trade_specialization || '',
        preferredShift: apiUser.preferred_shift || '',
        requiresBus: !!apiUser.requires_bus,
        requiresAccommodation: !!apiUser.requires_accommodation,
        isResumePublic: apiUser.is_resume_public !== false,
        companyName: apiUser.company_name || '',
        gstNumber: apiUser.gst_number || '',
      };

      dispatch({ type: 'UPDATE_USER', payload: user });
      dispatch({ type: 'LOGIN', payload: user });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  }, [dispatch, state.currentUser]);

  const deleteResume = useCallback(async () => {
    try {
      const response = await apiFetch('/api/v1/auth/resume', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || data.message || 'Failed to delete resume.' };
      }

      if (state.currentUser) {
        const updatedUser: User = {
          ...state.currentUser,
          resume: null
        };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        dispatch({ type: 'LOGIN', payload: updatedUser });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  }, [dispatch, state.currentUser]);

  const syncUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await apiFetch('/api/v1/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const apiUser = data.data;
          const user: User = {
            id: apiUser.id,
            name: typeof apiUser.name === 'string' ? apiUser.name : '',
            email: apiUser.email || '',
            role: apiUser.role as UserRole,
            phone: apiUser.phone || '',
            profilePictureUrl: normalizeProfilePicture(apiUser.profile_picture_url || apiUser.profilePictureUrl || apiUser.avatar_url || apiUser.avatar),
            createdAt: apiUser.created_at || new Date().toISOString(),
            profileComplete: !!apiUser.headline || !!apiUser.trade_specialization,
            resume: parseResumeField(apiUser.resume),
            experience: parseArrayField(apiUser.experience),
            education: parseArrayField(apiUser.education),
            skills: parseArrayField(apiUser.skills),
            savedJobs: parseArrayField(apiUser.savedJobs || state.currentUser?.savedJobs),
            appliedJobs: parseArrayField(apiUser.appliedJobs),
            appliedJobsWithStatus: parseArrayField(apiUser.appliedJobsWithStatus),
            headline: apiUser.headline || '',
            location: apiUser.location || '',
            tradeSpecialization: apiUser.trade_specialization || '',
            preferredShift: apiUser.preferred_shift || '',
            requiresBus: !!apiUser.requires_bus,
            requiresAccommodation: !!apiUser.requires_accommodation,
            isResumePublic: apiUser.is_resume_public !== false,
            companyName: apiUser.company_name || '',
            gstNumber: apiUser.gst_number || '',
          };
          dispatch({ type: 'UPDATE_USER', payload: user });
          dispatch({ type: 'LOGIN', payload: user });
        }
      }
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  }, [dispatch]);

  return {
    currentUser: state.currentUser,
    login,
    verify2FALogin,
    signup,
    verifyOtp,
    logout,
    updateUser,
    deleteResume,
    syncUser
  };
};

export default useAuth;
