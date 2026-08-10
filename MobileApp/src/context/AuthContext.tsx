import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { setOnUnauthenticated } from '../api/client';
import {
  saveTokens,
  saveStoredUser,
  getStoredUser,
  getAccessToken,
  clearAuthSession,
} from '../utils/secureStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPayload: any, password?: string, authMethod?: string, payload?: any) => Promise<any>;
  loginWithGoogle: (payload: any) => Promise<void>;
  verify2FALogin: (mfaToken: string, otpCode: string) => Promise<void>;
  signup: (payload: any) => Promise<{ email: string }>;
  verifyOTP: (email: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<User | void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Automatically reset user to null if an unauthenticated 401 response occurs
  useEffect(() => {
    setOnUnauthenticated(() => {
      setUser(null);
    });
  }, []);

  const refreshUser = async () => {
    try {
      const storedUser = (await getStoredUser()) || {};
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        const fetchedUser = (res.data as any).user || res.data;
        const photoUri =
          (storedUser as any)?.profile_picture_url ||
          (storedUser as any)?.profilePictureUrl ||
          (storedUser as any)?.avatar_url ||
          (storedUser as any)?.avatarUrl ||
          user?.profile_picture_url ||
          user?.profilePictureUrl;

        const photoPreservation = photoUri
          ? {
              profile_picture_url: fetchedUser?.profile_picture_url || fetchedUser?.profilePictureUrl || photoUri,
              profilePictureUrl: fetchedUser?.profilePictureUrl || fetchedUser?.profile_picture_url || photoUri,
              avatar_url: fetchedUser?.avatar_url || fetchedUser?.avatarUrl || photoUri,
              avatarUrl: fetchedUser?.avatarUrl || fetchedUser?.avatar_url || photoUri,
            }
          : {};

        const mergedUser = { ...storedUser, ...user, ...fetchedUser, ...photoPreservation };
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
        const storedUser = await getStoredUser();

        if (token && storedUser && mounted) {
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

  const login = async (emailOrPayload: any, password?: string, authMethod?: string, payload?: any) => {
    setIsLoading(true);
    try {
      const loginData = typeof emailOrPayload === 'object'
        ? emailOrPayload
        : { email: emailOrPayload, password, authMethod, ...payload };

      const res = await authApi.login(loginData);
      if (res.success && res.data) {
        const { user: userData, token, accessToken, refreshToken, sessionId, isMFAEnabled } = res.data;

        if (isMFAEnabled) {
          return { isMFAEnabled: true, mfaToken: (res.data as any).mfaToken };
        }

        const validToken = token || accessToken;
        if (!validToken) {
          throw new Error('Invalid authentication tokens from server');
        }

        await saveTokens({ accessToken: validToken, refreshToken }, sessionId);
        await saveStoredUser(userData);
        setUser(userData);
        return { success: true };
      } else {
        throw new Error(res.message || res.error || 'Login failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FALogin = async (mfaToken: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.verify2FALogin(mfaToken, otpCode);
      if (res.success && res.data) {
        const { accessToken, refreshToken, sessionId, user: userData } = res.data;
        if (!accessToken || !refreshToken) {
          throw new Error('Invalid authentication tokens from server');
        }

        await saveTokens({ accessToken, refreshToken }, sessionId);
        await saveStoredUser(userData);
        setUser(userData);
      } else {
        throw new Error(res.message || '2FA OTP Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(payload);
      if (res.success && res.data?.email) {
        return { email: res.data.email };
      }
      throw new Error(res.message || res.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyOTP(email, otpCode);
      if (res.success && res.data) {
        const { accessToken, refreshToken, sessionId, user: userData } = res.data;
        if (accessToken && refreshToken) {
          await saveTokens({ accessToken, refreshToken }, sessionId);
          await saveStoredUser(userData);
          setUser(userData);
        }
      } else {
        throw new Error(res.message || res.error || 'OTP Verification failed');
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

    let updatedUser = { ...storedUser, ...user, ...data, ...photoNormalizedData } as User;

    try {
      const res = await authApi.updateProfile({ ...data, ...photoNormalizedData });
      if (res.success && res.data) {
        const returnedUser = (res.data as any).user || res.data;
        if (returnedUser && typeof returnedUser === 'object') {
          updatedUser = { ...updatedUser, ...returnedUser, ...photoNormalizedData };
        }
      }
    } catch (e) {
      console.warn('Backend updateProfile sync notice:', e);
    }

    setUser(updatedUser);
    await saveStoredUser(updatedUser);
    return updatedUser;
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
    setIsLoading(true);
    try {
      await clearAuthSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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
    </AuthContext.Provider>
  );
};
