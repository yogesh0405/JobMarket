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
  login: (credentials: any) => Promise<any>;
  loginWithGoogle: (payload: any) => Promise<void>;
  verify2FALogin: (mfaToken: string, otpCode: string) => Promise<void>;
  signup: (payload: any) => Promise<{ email: string }>;
  verifyOTP: (email: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Automatically reset user to null if an unauthenticated 401 response occurs
  useEffect(() => {
    setOnUnauthenticated(() => {
      setUser(null);
    });
  }, []);

  const refreshUser = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        const fetchedUser = (res.data as any).user || res.data;
        setUser(fetchedUser);
        await saveStoredUser(fetchedUser);
      }
    } catch (error) {
      console.warn('Background profile refresh notice:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const token = await getAccessToken();
        const storedUser = await getStoredUser();

        if (mounted && token && storedUser) {
          setUser(storedUser);
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        if (res.data.require2FA) {
          return {
            require2FA: true,
            mfaToken: res.data.mfaToken,
            email: res.data.email,
            message: res.data.message,
          };
        }

        const { accessToken, refreshToken, sessionId, user: userData } = res.data;

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid authentication tokens from server');
        }

        // Save tokens to secure storage & fast memory cache
        await saveTokens({ accessToken, refreshToken }, sessionId);
        await saveStoredUser(userData);

        // Set user state to trigger navigation to Dashboard
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
    let updatedUser = { ...user, ...data } as User;
    try {
      const res = await authApi.updateProfile(data);
      if (res.success && res.data) {
        const returnedUser = (res.data as any).user || res.data;
        updatedUser = { ...updatedUser, ...returnedUser };
      }
    } catch (e) {
      console.warn('Backend updateProfile sync notice:', e);
    }

    setUser(updatedUser);
    await saveStoredUser(updatedUser);
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
