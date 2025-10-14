'use client';

import type { User } from '@pawfectmatch/core';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../lib/auth-store';
import api from '../services/api';
import { logger } from '../services/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  dateOfBirth?: string;
  location?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Production-ready authentication hook with Zustand store integration
 * Handles login, register, logout, token refresh, and session management
 */
type UseAuthResult = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null | undefined;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthResponse['user']>) => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  verifySession: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    
    logout: storeLogout,
    setIsLoading,
    setError,
  } = useAuthStore();

  // Initialize API with stored token
  useEffect(() => {
    if (accessToken) {
      api.setToken(accessToken);
    }
  }, [accessToken]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Call logout endpoint to invalidate server-side session
      if (accessToken) {
        await fetch(
          `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/auth/logout`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          },
        );
      }
    } catch (error) {
      logger.error('Logout API error', { error });
      // Continue with local logout even if API call fails
    }

    // Clear all auth data
    storeLogout();
    api.clearToken();

    // Clear auth cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; samesite=strict';

    // Redirect to login page
    router.push('/login');

    setIsLoading(false);
    logger.info('User logged out');
  }, [accessToken, storeLogout, router, setIsLoading]);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) {
      logger.warn('No refresh token available');
      return false;
    }

    try {
      const response = await fetch(
        `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: { accessToken: string; refreshToken: string } = await response.json();

      // Update tokens
      setTokens(data.accessToken, data.refreshToken);
      api.setToken(data.accessToken);

      // Update cookie
      document.cookie = `auth-token=${data.accessToken}; path=/; max-age=86400; samesite=strict`;

      logger.info('Access token refreshed successfully');
      return true;
    } catch (error) {
      logger.error('Token refresh error', { error });
      // If refresh fails, logout user
      await logout();
      return false;
    }
  }, [refreshToken, setTokens, logout]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!refreshToken || !accessToken) {
      return undefined;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = (): void => {
      try {
        const payloadRaw = accessToken.split('.')[1];
        if (!payloadRaw) {
          throw new Error('Invalid access token');
        }

        const payload = JSON.parse(atob(payloadRaw)) as { exp: number };
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const refreshTime = expiryTime - 5 * 60 * 1000; // Refresh 5 minutes before expiry

        if (currentTime >= refreshTime) {
          void refreshAccessToken();
        } else {
          timeout = setTimeout(() => {
            void refreshAccessToken();
          }, Math.max(refreshTime - currentTime, 0));
        }
      } catch (error) {
        logger.error('Failed to decode token for refresh', { error });
      }
    };

    scheduleRefresh();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [accessToken, refreshToken, refreshAccessToken]);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include', // For cookies
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data: AuthResponse = await response.json();

        // Store tokens and user data
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        api.setToken(data.accessToken);

        // Set cookie for middleware auth
        document.cookie = `auth-token=${data.accessToken}; path=/; max-age=86400; samesite=strict`;

        logger.info('User logged in successfully', { userId: data.user.id });

        return true;
      } catch (error: unknown) {
        logger.error('Login error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Failed to login';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, setTokens, setUser],
  );

  /**
   * Register new user account
   */
  const register = useCallback(
    async (data: RegisterData): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/auth/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const responseData: AuthResponse = await response.json();

        // Store tokens and user data
        setTokens(responseData.accessToken, responseData.refreshToken);
        setUser(responseData.user);
        api.setToken(responseData.accessToken);

        // Set cookie for middleware auth
        document.cookie = `auth-token=${responseData.accessToken}; path=/; max-age=86400; samesite=strict`;

        logger.info('User registered successfully', { userId: responseData.user.id });

        return true;
      } catch (error: unknown) {
        logger.error('Registration error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Failed to register';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, setTokens, setUser],
  );

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<AuthResponse['user']>): Promise<boolean> => {
      if (!accessToken) {
        setError('Not authenticated');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/users/profile`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updates),
            credentials: 'include',
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Profile update failed');
        }

        const updatedUser = await response.json();
        setUser(updatedUser);

        logger.info('Profile updated successfully');
        return true;
      } catch (error: unknown) {
        logger.error('Profile update error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, setUser, setError, setIsLoading],
  );

  /**
   * Verify user session on app load
   */
  const verifySession = useCallback(async (): Promise<void> => {
    if (!accessToken) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/auth/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Session verification failed');
      }

      const userData = await response.json();
      setUser(userData);

      logger.info('Session verified successfully');
    } catch (error) {
      logger.error('Session verification error', { error });
      // Clear invalid session
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, setUser, logout, setIsLoading]);

  // Verify session on mount - only after hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && accessToken && !user) {
      verifySession();
    }
  }, [accessToken, user, verifySession]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    loading: isLoading, // Alias for compatibility
    error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshAccessToken,
    verifySession,
  };
}
