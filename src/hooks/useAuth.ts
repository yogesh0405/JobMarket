import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { User, UserRole } from '../types';

export const useAuth = () => {
  const { state, dispatch } = useStore();

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
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

      const { accessToken, refreshToken, user: apiUser } = data.data;

      // Persist tokens for subsequent authenticated requests
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Map the backend user shape to the frontend User type
      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role as UserRole,
        phone: '',
        createdAt: new Date().toISOString(),
        profileComplete: false,
        resume: null,
        experience: [],
        education: [],
        skills: [],
        savedJobs: [],
        appliedJobs: [],
      };

      dispatch({ type: 'LOGIN', payload: user });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  }, [dispatch]);

  const signup = useCallback(async (userData: any) => {
    try {
      const response = await fetch('/api/v1/auth/signup', {
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
      const response = await fetch('/api/v1/auth/verify-otp', {
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
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, [dispatch]);

  return {
    currentUser: state.currentUser,
    login,
    signup,
    verifyOtp,
    logout,
    updateUser
  };
};
