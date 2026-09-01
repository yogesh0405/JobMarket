import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { setOnUnauthenticated } from '../api/client';
import {
  saveTokens,
  saveStoredUser,
  getStoredUser,
  getAccessToken,
  getRefreshToken,
  clearAuthSession,
} from '../utils/secureStorage';
import { setGlobalCompanyLogo } from '../utils/companyLogos';
import { LogoutProcessingModal } from '../components/common/LogoutProcessingModal';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  login: (emailOrPayload: any, password?: string, authMethod?: string, payload?: any) => Promise<any>;
  loginWithGoogle: (payload: any) => Promise<void>;
  verify2FALogin: (mfaToken: string, otpCode: string) => Promise<any>;
  signup: (payload: any) => Promise<{ success?: boolean; email: string }>;
  verifyOTP: (email: string, otpCode: string, autoLogin?: boolean) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<User | void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Automatically reset user to null ONLY when credentials are confirmed invalid
  useEffect(() => {
    setOnUnauthenticated(async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        setUser(null);
      }
    });
  }, []);

  const refreshUser = async () => {
    try {
      const storedUser = (await getStoredUser()) || {};
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        const fetchedUser = (res.data as any).user || res.data;

        // Include defined properties (including empty strings "") so server updates and field deletions on Web sync accurately
        const cleanedServerData: any = {};
        if (fetchedUser && typeof fetchedUser === 'object') {
          Object.keys(fetchedUser).forEach((key) => {
            if (fetchedUser[key] !== undefined) {
              cleanedServerData[key] = fetchedUser[key];
            }
          });
        }

        const serverPhotoUri =
          fetchedUser?.profile_picture_url ||
          fetchedUser?.profilePictureUrl ||
          fetchedUser?.avatar_url ||
          fetchedUser?.avatarUrl ||
          fetchedUser?.companyLogo ||
          fetchedUser?.company_logo ||
          fetchedUser?.logoUrl ||
          fetchedUser?.logo_url;

        const localPhotoUri =
          (storedUser as any)?.profile_picture_url ||
          (storedUser as any)?.profilePictureUrl ||
          (storedUser as any)?.avatar_url ||
          (storedUser as any)?.avatarUrl ||
          (storedUser as any)?.companyLogo ||
          (storedUser as any)?.company_logo ||
          user?.profile_picture_url ||
          user?.profilePictureUrl;

        // Prioritize real-time backend server photo (PostgreSQL) over old local storage cached photo
        const activePhotoUri = serverPhotoUri || localPhotoUri;

        const photoNormalizedData = activePhotoUri
          ? {
              profile_picture_url: activePhotoUri,
              profilePictureUrl: activePhotoUri,
              avatar_url: activePhotoUri,
              avatarUrl: activePhotoUri,
              avatar: activePhotoUri,
              companyLogo: activePhotoUri,
              company_logo: activePhotoUri,
              logoUrl: activePhotoUri,
              logo_url: activePhotoUri,
            }
          : {};

        const companyName = fetchedUser?.companyName || fetchedUser?.company_name || (storedUser as any)?.companyName || user?.companyName;
        if (companyName && activePhotoUri) {
          setGlobalCompanyLogo(companyName, activePhotoUri);
        }

        // Merge: local state FIRST, server data SECOND so live server profile updates take precedence
        const mergedUser = { ...storedUser, ...user, ...fetchedUser, ...cleanedServerData, ...photoNormalizedData };

        if (fetchedUser.headline !== undefined) {
          mergedUser.headline = fetchedUser.headline;
        }
        if (fetchedUser.location !== undefined) {
          mergedUser.location = fetchedUser.location;
        }
        if (fetchedUser.bio !== undefined) {
          mergedUser.bio = fetchedUser.bio;
        }
        if (fetchedUser.midc_zone || fetchedUser.midcZone) {
          (mergedUser as any).midc_zone = fetchedUser.midc_zone || fetchedUser.midcZone;
          (mergedUser as any).midcZone = fetchedUser.midcZone || fetchedUser.midc_zone;
        }
        if (fetchedUser.trade_specialization || fetchedUser.tradeSpecialization) {
          (mergedUser as any).trade_specialization = fetchedUser.trade_specialization || fetchedUser.tradeSpecialization;
          (mergedUser as any).tradeSpecialization = fetchedUser.tradeSpecialization || fetchedUser.trade_specialization;
        }
        if (fetchedUser.preferred_shift || fetchedUser.preferredShift) {
          (mergedUser as any).preferred_shift = fetchedUser.preferred_shift || fetchedUser.preferredShift;
          (mergedUser as any).preferredShift = fetchedUser.preferredShift || fetchedUser.preferred_shift;
        }

        if (!fetchedUser.resume && !fetchedUser.resume_url && !fetchedUser.resumeUrl) {
          mergedUser.resume = null;
          (mergedUser as any).resume_url = null;
          (mergedUser as any).resumeUrl = null;
          (mergedUser as any).resumeName = null;
        }

        setUser(mergedUser);
        await saveStoredUser(mergedUser);
      } else if (storedUser && Object.keys(storedUser).length > 0) {
        setUser(storedUser as User);
      }
    } catch (error) {
      console.warn('Background profile refresh notice:', error);
      const storedUser = await getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const token = await getAccessToken();
        const refreshToken = await getRefreshToken();
        const storedUser = await getStoredUser();

        if ((token || refreshToken) && storedUser && mounted) {
          setUser(storedUser);
        }
      } catch (error) {
        console.warn('Failed to restore auth state:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (emailOrPayload: any, password?: string, roleOrAuthMethod?: string, payload?: any) => {
    setIsLoading(true);
    try {
      const explicitRole = typeof emailOrPayload === 'object'
        ? (emailOrPayload.role || emailOrPayload.authMethod)
        : (roleOrAuthMethod || payload?.role);

      const loginData = typeof emailOrPayload === 'object'
        ? { role: explicitRole, ...emailOrPayload }
        : { email: emailOrPayload, password, role: explicitRole, authMethod: explicitRole, ...payload };

      const res: any = await authApi.login(loginData);
      if (res && res.success) {
        const isMFA =
          res.require2FA ||
          res.requires2FA ||
          res.data?.require2FA ||
          res.data?.requires2FA ||
          res.data?.isMFAEnabled ||
          (res.message && res.message.toLowerCase().includes('2fa'));

        const mfaToken = res.mfaToken || res.data?.mfaToken || `mfa_${Date.now()}`;
        const mfaEmail = res.email || res.data?.email || loginData.email;

        // If 2FA is triggered, immediately return 2FA payload so the UI presents the 6-digit modal
        if (isMFA) {
          return {
            require2FA: true,
            requires2FA: true,
            isMFAEnabled: true,
            mfaToken,
            email: mfaEmail,
            message: res.data?.message || res.message || 'Two-Factor Authentication is enabled. Please enter the 6-digit code sent to your email.'
          };
        }

        const tokenObj = res.tokens || res.data?.tokens || res.data;
        const validAccessToken = res.data?.accessToken || res.data?.token || res.token || tokenObj?.accessToken || tokenObj?.token;
        const validRefreshToken = res.data?.refreshToken || tokenObj?.refreshToken;
        const validSessionId = res.data?.sessionId || tokenObj?.sessionId || res.sessionId;
        const userData = res.data?.user || (res.data?.id ? res.data : res.user);

        // If accessToken is missing from a successful login, treat as 2FA challenge
        if (!validAccessToken) {
          return {
            require2FA: true,
            requires2FA: true,
            isMFAEnabled: true,
            mfaToken,
            email: mfaEmail,
            message: 'Two-Factor Authentication is enabled. Please enter the 6-digit code sent to your email.'
          };
        }

        await saveTokens({ accessToken: validAccessToken, refreshToken: validRefreshToken }, validSessionId);
        if (userData) {
          await saveStoredUser(userData);
          setUser(userData);
        }
        return { success: true };
      } else {
        throw new Error(res?.message || res?.error || 'Login failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FALogin = async (mfaToken: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const res: any = await authApi.verify2FALogin(mfaToken, otpCode);
      const payload: any = res.data || res;
      const accessToken =
        res.accessToken ||
        payload.accessToken ||
        payload.token ||
        (res.data && res.data.accessToken) ||
        (res.tokens && res.tokens.accessToken);
      const refreshToken =
        res.refreshToken ||
        payload.refreshToken ||
        (res.data && res.data.refreshToken) ||
        (res.tokens && res.tokens.refreshToken);
      const sessionId =
        res.sessionId ||
        payload.sessionId ||
        (res.data && res.data.sessionId) ||
        (res.tokens && res.tokens.sessionId);
      const userData =
        res.user ||
        payload.user ||
        (res.data && res.data.user);

      if (res.success && accessToken) {
        await saveTokens({ accessToken, refreshToken }, sessionId);
        if (userData) {
          await saveStoredUser(userData);
          setUser(userData);
        }
        return { success: true, user: userData };
      } else {
        throw new Error(res.message || (res as any).error || '2FA OTP Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(payload);
      if (res && (res.success || res.data || (res as any).email)) {
        const returnedEmail = res.data?.email || (res as any).email || payload?.email;
        return { success: true, email: returnedEmail };
      }
      throw new Error(res?.message || (res as any)?.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otpCode: string, autoLogin: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyOTP(email, otpCode);
      const data = res.data || (res as any);
      if (res.success && data) {
        const accessToken = data.accessToken || data.token || (data.tokens && data.tokens.accessToken);
        const refreshToken = data.refreshToken || (data.tokens && data.tokens.refreshToken);
        const sessionId = data.sessionId || (data.tokens && data.tokens.sessionId);
        const userData = data.user || data;
        if (autoLogin && accessToken) {
          await saveTokens({ accessToken, refreshToken: refreshToken || '' }, sessionId);
          if (userData) {
            await saveStoredUser(userData);
            setUser(userData);
          }
        }
        return { success: true, user: userData };
      } else {
        throw new Error(res?.message || (res as any)?.error || 'Registration unsuccessful. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    const storedUser = (await getStoredUser()) || {};

    const photoUri =
      (data as any)?.profile_picture_url ||
      (data as any)?.profilePictureUrl ||
      (data as any)?.avatar_url ||
      (data as any)?.avatarUrl ||
      (data as any)?.avatar ||
      (data as any)?.companyLogo ||
      (data as any)?.company_logo ||
      (data as any)?.logoUrl ||
      (data as any)?.logo_url;

    const photoNormalizedData = photoUri
      ? {
          profile_picture_url: photoUri,
          profilePictureUrl: photoUri,
          avatar_url: photoUri,
          avatarUrl: photoUri,
          avatar: photoUri,
          companyLogo: photoUri,
          company_logo: photoUri,
          logoUrl: photoUri,
          logo_url: photoUri,
        }
      : {};

    // Standardize all profile fields (both camelCase and snake_case)
    const normalizedData: any = {
      ...data,
      ...photoNormalizedData,
    };

    if (data.companyName || (data as any).company_name) {
      normalizedData.companyName = data.companyName || (data as any).company_name;
      normalizedData.company_name = (data as any).company_name || data.companyName;
    }
    if (data.tradeSpecialization || (data as any).trade_specialization) {
      normalizedData.tradeSpecialization = data.tradeSpecialization || (data as any).trade_specialization;
      normalizedData.trade_specialization = (data as any).trade_specialization || data.tradeSpecialization;
    }
    if (data.gstNumber || (data as any).gst_number) {
      normalizedData.gstNumber = data.gstNumber || (data as any).gst_number;
      normalizedData.gst_number = (data as any).gst_number || data.gstNumber;
    }
    if (data.midcZone || (data as any).midc_zone) {
      normalizedData.midcZone = data.midcZone || (data as any).midc_zone;
      normalizedData.midc_zone = (data as any).midc_zone || data.midcZone;
    }
    if ((data as any).contactPerson || (data as any).contact_person) {
      normalizedData.contactPerson = (data as any).contactPerson || (data as any).contact_person;
      normalizedData.contact_person = (data as any).contact_person || (data as any).contactPerson;
    }
    if ((data as any).companyDescription || (data as any).company_description) {
      normalizedData.companyDescription = (data as any).companyDescription || (data as any).company_description;
      normalizedData.company_description = (data as any).company_description || (data as any).companyDescription;
    }
    if (data.bio !== undefined) {
      normalizedData.bio = data.bio;
    }
    if (data.resume === null || (data as any).resume_url === '' || (data as any).resumeUrl === '') {
      normalizedData.resume = null;
      normalizedData.resume_url = null;
      normalizedData.resumeUrl = null;
      normalizedData.resumeName = null;
    }

    let updatedUser = { ...storedUser, ...user, ...normalizedData } as User;
    if (normalizedData.resume === null) {
      updatedUser.resume = null;
      (updatedUser as any).resume_url = null;
      (updatedUser as any).resumeUrl = null;
      (updatedUser as any).resumeName = null;
    }

    const companyName = normalizedData.companyName || normalizedData.company_name || (storedUser as any)?.companyName || user?.companyName;
    if (companyName && photoUri) {
      setGlobalCompanyLogo(companyName, photoUri);
    }

    // Call live backend API to update PostgreSQL database as single source of truth
    const res = await authApi.updateProfile(normalizedData);
    if (!res.success) {
      throw new Error(res.message || res.error || 'Failed to update profile in database');
    }

    const returnedUser = (res.data as any)?.user || res.data || {};
    const finalUser = { ...storedUser, ...user, ...returnedUser, ...normalizedData } as User;

    setUser(finalUser);
    await saveStoredUser(finalUser);
    return finalUser;
  };

  const loginWithGoogle = async (googlePayload: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.googleAuth(googlePayload);
      if (res.success && res.data) {
        const { user: userData, token, accessToken, refreshToken, sessionId } = res.data as any;
        const validToken = token || accessToken;
        if (!validToken) {
          throw new Error('Invalid authentication tokens from server');
        }
        await saveTokens({ accessToken: validToken, refreshToken }, sessionId);
        await saveStoredUser(userData);
        setUser(userData);
        return;
      }
      throw new Error(res.message || res.error || 'Google Sign-In failed on server.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    // Fire-and-forget server logout in background without blocking UI
    authApi.logout().catch(() => {});

    try {
      await clearAuthSession();
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUser(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggingOut,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        verify2FALogin,
        signup,
        verifyOTP,
        logout,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
      <LogoutProcessingModal visible={isLoggingOut} />
    </AuthContext.Provider>
  );
};
