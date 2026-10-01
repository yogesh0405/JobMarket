import { useCallback, useEffect, useRef } from 'react';
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
  if (typeof val === 'object' && val !== null) {
    if (!val.url && !val.name && !val.size && !val.uploadedAt) return null;
    return val;
  }
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) {
        if (!parsed.url && !parsed.name && !parsed.size && !parsed.uploadedAt) return null;
        return parsed;
      }
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
  const currentUserRef = useRef(state.currentUser);

  useEffect(() => {
    currentUserRef.current = state.currentUser;
  }, [state.currentUser]);

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
        is_two_factor_enabled: Boolean(apiUser.is_two_factor_enabled ?? apiUser.isTwoFactorEnabled),
        isTwoFactorEnabled: Boolean(apiUser.is_two_factor_enabled ?? apiUser.isTwoFactorEnabled),
        has_password: apiUser.has_password !== undefined ? apiUser.has_password : apiUser.hasPassword,
        hasPassword: apiUser.hasPassword !== undefined ? apiUser.hasPassword : apiUser.has_password,
        auth_provider: apiUser.auth_provider,
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
        is_two_factor_enabled: Boolean(apiUser.is_two_factor_enabled ?? apiUser.isTwoFactorEnabled ?? true),
        isTwoFactorEnabled: Boolean(apiUser.is_two_factor_enabled ?? apiUser.isTwoFactorEnabled ?? true),
        has_password: apiUser.has_password !== undefined ? apiUser.has_password : apiUser.hasPassword,
        hasPassword: apiUser.hasPassword !== undefined ? apiUser.hasPassword : apiUser.has_password,
        auth_provider: apiUser.auth_provider,
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
    // 1. Immediately wipe all auth and session identifiers from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('token');
    localStorage.removeItem('saved_jobs_ids');

    // 2. Synchronously nullify currentUser in persisted local storage so instant reloads never revive user
    try {
      const saved = localStorage.getItem('jobMarketplace_react');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.currentUser = null;
        localStorage.setItem('jobMarketplace_react', JSON.stringify(parsed));
      }
    } catch (_) {}

    // 3. Dispatch LOGOUT to React store
    dispatch({ type: 'LOGOUT' });

    // 4. Fire background server-side logout (fire-and-forget)
    apiFetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});

    // 5. Broadcast logout event to any listening components
    window.dispatchEvent(new Event('auth:logout'));
  }, [dispatch]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    // 1. Optimistic UI update (LinkedIn standard)
    if (state.currentUser) {
      const optimisticUser: User = {
        ...state.currentUser,
        ...updates,
        profilePictureUrl: updates.profilePictureUrl || (updates as any).logo || (updates as any).profile_picture_url || state.currentUser.profilePictureUrl,
        companyName: updates.companyName || (updates as any).company_name || state.currentUser.companyName,
        tradeSpecialization: updates.tradeSpecialization || (updates as any).trade_specialization || (updates as any).industry || state.currentUser.tradeSpecialization,
      };
      dispatch({ type: 'UPDATE_USER', payload: optimisticUser });
      dispatch({ type: 'LOGIN', payload: optimisticUser });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:profile-updated', { detail: optimisticUser }));
      }
    }

    try {
      const response = await apiFetch('/api/v1/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || data.message || 'Failed to update profile.' };
      }

      const rawApiUser = data.data?.user || data.data || data.user || updates;
      if (!rawApiUser) {
        return { success: true };
      }

      const apiUser = {
        ...(state.currentUser || {}),
        ...rawApiUser,
        ...updates,
      };

      const user: User = {
        id: apiUser.id || state.currentUser?.id || '',
        name: typeof apiUser.name === 'string' ? apiUser.name : (state.currentUser?.name || ''),
        email: apiUser.email || state.currentUser?.email || '',
        role: (apiUser.role || state.currentUser?.role || 'candidate') as UserRole,
        phone: apiUser.phone || state.currentUser?.phone || '',
        profilePictureUrl: normalizeProfilePicture(apiUser.profile_picture_url || apiUser.profilePictureUrl || apiUser.avatar_url || apiUser.avatar || apiUser.logo || state.currentUser?.profilePictureUrl),
        createdAt: apiUser.created_at || apiUser.createdAt || state.currentUser?.createdAt || new Date().toISOString(),
        profileComplete: !!apiUser.headline || !!apiUser.trade_specialization || !!apiUser.tradeSpecialization || !!apiUser.company_name || !!apiUser.companyName,
        resume: parseResumeField(apiUser.resume !== undefined ? apiUser.resume : state.currentUser?.resume),
        experience: parseArrayField(apiUser.experience !== undefined ? apiUser.experience : state.currentUser?.experience),
        education: parseArrayField(apiUser.education !== undefined ? apiUser.education : state.currentUser?.education),
        skills: parseArrayField(apiUser.skills !== undefined ? apiUser.skills : state.currentUser?.skills),
        savedJobs: parseArrayField(apiUser.savedJobs || apiUser.saved_jobs || state.currentUser?.savedJobs),
        appliedJobs: parseArrayField(apiUser.appliedJobs || apiUser.applied_jobs || state.currentUser?.appliedJobs),
        appliedJobsWithStatus: parseArrayField(apiUser.appliedJobsWithStatus || apiUser.applied_jobs_with_status || state.currentUser?.appliedJobsWithStatus),
        headline: apiUser.headline || state.currentUser?.headline || '',
        location: apiUser.location || apiUser.address || apiUser.city || state.currentUser?.location || '',
        tradeSpecialization: apiUser.trade_specialization || apiUser.tradeSpecialization || apiUser.industry || state.currentUser?.tradeSpecialization || '',
        preferredShift: apiUser.preferred_shift || apiUser.preferredShift || state.currentUser?.preferredShift || '',
        requiresBus: apiUser.requires_bus !== undefined ? !!apiUser.requires_bus : (apiUser.requiresBus !== undefined ? !!apiUser.requiresBus : !!state.currentUser?.requiresBus),
        requiresAccommodation: apiUser.requires_accommodation !== undefined ? !!apiUser.requires_accommodation : (apiUser.requiresAccommodation !== undefined ? !!apiUser.requiresAccommodation : !!state.currentUser?.requiresAccommodation),
        isResumePublic: apiUser.is_resume_public !== undefined ? apiUser.is_resume_public !== false : (apiUser.isResumePublic !== undefined ? apiUser.isResumePublic !== false : state.currentUser?.isResumePublic !== false),
        companyName: apiUser.company_name || apiUser.companyName || state.currentUser?.companyName || '',
        companyDescription: apiUser.company_description || apiUser.companyDescription || apiUser.bio || state.currentUser?.companyDescription || '',
        bio: apiUser.bio || apiUser.company_description || apiUser.companyDescription || state.currentUser?.bio || '',
        gstNumber: apiUser.gst_number || apiUser.gstNumber || state.currentUser?.gstNumber || '',
        companyType: apiUser.company_type || apiUser.companyType || state.currentUser?.companyType || '',
        companySize: apiUser.company_size || apiUser.companySize || state.currentUser?.companySize || '',
        foundedYear: apiUser.founded_year || apiUser.foundedYear || state.currentUser?.foundedYear || undefined,
        midcZone: apiUser.midc_zone || apiUser.midcZone || state.currentUser?.midcZone || '',
        website: apiUser.website || state.currentUser?.website || '',
        address: apiUser.address || state.currentUser?.address || '',
        city: apiUser.city || state.currentUser?.city || '',
        state: apiUser.state || state.currentUser?.state || '',
        logo: apiUser.logo || apiUser.profile_picture_url || apiUser.profilePictureUrl || state.currentUser?.logo || '',
        is_two_factor_enabled: (updates as any).is_two_factor_enabled !== undefined ? Boolean((updates as any).is_two_factor_enabled) : (apiUser.is_two_factor_enabled !== undefined ? Boolean(apiUser.is_two_factor_enabled) : (apiUser.isTwoFactorEnabled !== undefined ? Boolean(apiUser.isTwoFactorEnabled) : state.currentUser?.is_two_factor_enabled)),
        isTwoFactorEnabled: (updates as any).isTwoFactorEnabled !== undefined ? Boolean((updates as any).isTwoFactorEnabled) : (apiUser.isTwoFactorEnabled !== undefined ? Boolean(apiUser.isTwoFactorEnabled) : (apiUser.is_two_factor_enabled !== undefined ? Boolean(apiUser.is_two_factor_enabled) : state.currentUser?.isTwoFactorEnabled)),
        has_password: (updates as any).has_password !== undefined ? (updates as any).has_password : (apiUser.has_password !== undefined ? apiUser.has_password : state.currentUser?.has_password),
        hasPassword: (updates as any).hasPassword !== undefined ? (updates as any).hasPassword : (apiUser.hasPassword !== undefined ? apiUser.hasPassword : state.currentUser?.hasPassword),
        auth_provider: apiUser.auth_provider || state.currentUser?.auth_provider,
      };

      dispatch({ type: 'UPDATE_USER', payload: user });
      dispatch({ type: 'LOGIN', payload: user });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:profile-updated', { detail: user }));
      }
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

  const update2FAStatus = useCallback((enabled: boolean) => {
    if (state.currentUser) {
      const updatedUser: User = {
        ...state.currentUser,
        is_two_factor_enabled: enabled,
        isTwoFactorEnabled: enabled,
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'LOGIN', payload: updatedUser });
    }
  }, [dispatch, state.currentUser]);

  const syncUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await apiFetch('/api/v1/auth/me');
      // If user logged out while request was in flight, abort immediately
      if (!localStorage.getItem('accessToken')) return;

      if (response.ok) {
        const data = await response.json();
        // Check token once more before updating store
        if (!localStorage.getItem('accessToken')) return;

        if (data.success && (data.data || data.user)) {
          const rawApiUser = data.data?.user || data.data || data.user;
          const current = currentUserRef.current;
          const apiUser = {
            ...(current || {}),
            ...rawApiUser,
          };
          const user: User = {
            id: apiUser.id || current?.id || '',
            name: typeof apiUser.name === 'string' ? apiUser.name : (current?.name || ''),
            email: apiUser.email || current?.email || '',
            role: (apiUser.role || current?.role || 'candidate') as UserRole,
            phone: apiUser.phone || current?.phone || '',
            profilePictureUrl: normalizeProfilePicture(apiUser.profile_picture_url || apiUser.profilePictureUrl || apiUser.avatar_url || apiUser.avatar || apiUser.logo || current?.profilePictureUrl),
            createdAt: apiUser.created_at || apiUser.createdAt || current?.createdAt || new Date().toISOString(),
            profileComplete: !!apiUser.headline || !!apiUser.trade_specialization || !!apiUser.tradeSpecialization || !!apiUser.company_name || !!apiUser.companyName,
            resume: parseResumeField(apiUser.resume !== undefined ? apiUser.resume : current?.resume),
            experience: parseArrayField(apiUser.experience !== undefined ? apiUser.experience : current?.experience),
            education: parseArrayField(apiUser.education !== undefined ? apiUser.education : current?.education),
            skills: parseArrayField(apiUser.skills !== undefined ? apiUser.skills : current?.skills),
            savedJobs: parseArrayField(apiUser.savedJobs || apiUser.saved_jobs || current?.savedJobs),
            appliedJobs: parseArrayField(apiUser.appliedJobs || apiUser.applied_jobs || current?.appliedJobs),
            appliedJobsWithStatus: parseArrayField(apiUser.appliedJobsWithStatus || apiUser.applied_jobs_with_status || current?.appliedJobsWithStatus),
            headline: apiUser.headline || current?.headline || '',
            location: apiUser.location || apiUser.address || apiUser.city || current?.location || '',
            tradeSpecialization: apiUser.trade_specialization || apiUser.tradeSpecialization || apiUser.industry || current?.tradeSpecialization || '',
            preferredShift: apiUser.preferred_shift || apiUser.preferredShift || current?.preferredShift || '',
            requiresBus: apiUser.requires_bus !== undefined ? !!apiUser.requires_bus : (apiUser.requiresBus !== undefined ? !!apiUser.requiresBus : !!current?.requiresBus),
            requiresAccommodation: apiUser.requires_accommodation !== undefined ? !!apiUser.requires_accommodation : (apiUser.requiresAccommodation !== undefined ? !!apiUser.requiresAccommodation : !!current?.requiresAccommodation),
            isResumePublic: apiUser.is_resume_public !== undefined ? apiUser.is_resume_public !== false : (apiUser.isResumePublic !== undefined ? apiUser.isResumePublic !== false : current?.isResumePublic !== false),
            companyName: apiUser.company_name || apiUser.companyName || current?.companyName || '',
            companyDescription: apiUser.company_description || apiUser.companyDescription || apiUser.bio || current?.companyDescription || '',
            bio: apiUser.bio || apiUser.company_description || apiUser.companyDescription || current?.bio || '',
            gstNumber: apiUser.gst_number || apiUser.gstNumber || current?.gstNumber || '',
            companyType: apiUser.company_type || apiUser.companyType || current?.companyType || '',
            companySize: apiUser.company_size || apiUser.companySize || current?.companySize || '',
            foundedYear: apiUser.founded_year || apiUser.foundedYear || current?.foundedYear || undefined,
            midcZone: apiUser.midc_zone || apiUser.midcZone || current?.midcZone || '',
            website: apiUser.website || current?.website || '',
            address: apiUser.address || current?.address || '',
            city: apiUser.city || current?.city || '',
            state: apiUser.state || current?.state || '',
            logo: apiUser.logo || apiUser.profile_picture_url || apiUser.profilePictureUrl || current?.logo || '',
            is_two_factor_enabled: apiUser.is_two_factor_enabled !== undefined ? Boolean(apiUser.is_two_factor_enabled) : (apiUser.isTwoFactorEnabled !== undefined ? Boolean(apiUser.isTwoFactorEnabled) : current?.is_two_factor_enabled),
            isTwoFactorEnabled: apiUser.isTwoFactorEnabled !== undefined ? Boolean(apiUser.isTwoFactorEnabled) : (apiUser.is_two_factor_enabled !== undefined ? Boolean(apiUser.is_two_factor_enabled) : current?.isTwoFactorEnabled),
            has_password: apiUser.has_password !== undefined ? apiUser.has_password : current?.has_password,
            hasPassword: apiUser.hasPassword !== undefined ? apiUser.hasPassword : current?.hasPassword,
            auth_provider: apiUser.auth_provider || current?.auth_provider,
          };
          if (!localStorage.getItem('accessToken')) return;
          dispatch({ type: 'UPDATE_USER', payload: user });
          dispatch({ type: 'LOGIN', payload: user });
        }
      }
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  }, [dispatch]);

  const loginWithGoogle = useCallback(async (tokenOrPayload: string | { idToken?: string; accessToken?: string; picture?: string; name?: string; email?: string }, role: UserRole) => {
    try {
      const payload = typeof tokenOrPayload === 'string'
        ? { idToken: tokenOrPayload, role }
        : { ...tokenOrPayload, role };

      const response = await apiFetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || data.message || 'Google Sign-In failed';
        return { success: false, error: errorMessage };
      }

      const { accessToken, refreshToken, sessionId, user: apiUser } = data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (sessionId) {
        localStorage.setItem('sessionId', sessionId);
      }

      const rawPhoto = apiUser.profile_picture_url ||
                       apiUser.profilePictureUrl ||
                       (typeof tokenOrPayload === 'object' ? tokenOrPayload.picture : '') ||
                       apiUser.avatar_url ||
                       apiUser.avatar;

      const user: User = {
        id: apiUser.id,
        name: typeof apiUser.name === 'string' ? apiUser.name : '',
        email: apiUser.email || '',
        role: apiUser.role as UserRole,
        phone: apiUser.phone || '',
        profilePictureUrl: normalizeProfilePicture(rawPhoto),
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
        is_two_factor_enabled: Boolean(apiUser.is_two_factor_enabled ?? apiUser.isTwoFactorEnabled),
        isTwoFactorEnabled: Boolean(apiUser.is_two_factor_enabled ?? apiUser.isTwoFactorEnabled),
        has_password: apiUser.has_password !== undefined ? apiUser.has_password : apiUser.hasPassword,
        hasPassword: apiUser.hasPassword !== undefined ? apiUser.hasPassword : apiUser.has_password,
        auth_provider: apiUser.auth_provider || 'google',
      };

      dispatch({ type: 'LOGIN', payload: user });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Network error during Google Sign-In. Please try again.' };
    }
  }, [dispatch]);

  return {
    currentUser: state.currentUser,
    login,
    loginWithGoogle,
    verify2FALogin,
    signup,
    verifyOtp,
    logout,
    updateUser,
    deleteResume,
    syncUser,
    update2FAStatus
  };
};

export default useAuth;
