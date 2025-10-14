'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuthStore } from '../../lib/auth-store';
import type { User } from '../../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for compatibility
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    dateOfBirth?: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const authStore = useAuthStore();

  // Real login function using API with request deduplication
  const login = async (email: string, password: string): Promise<boolean> => {
    // Prevent multiple concurrent login requests
    if (authStore.isLoading) {
      return false;
    }

    authStore.setIsLoading(true);
    authStore.setError(null);

    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000';
      // Remove /api if it exists since we're adding it
      const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        authStore.setError(data.message || 'Login failed');
        return false;
      }

      if (data.data?.user && data.data?.accessToken) {
        authStore.setUser(data.data.user);
        authStore.setTokens(data.data.accessToken, data.data.refreshToken || data.data.accessToken);
        return true;
      }

      authStore.setError('Invalid response from server');
      return false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      authStore.setError(errorMessage);
      return false;
    } finally {
      authStore.setIsLoading(false);
    }
  };

  // Real register function using API with request deduplication
  const register = async (
    email: string,
    password: string,
    name: string,
    dateOfBirth?: string,
  ): Promise<boolean> => {
    // Prevent multiple concurrent register requests
    if (authStore.isLoading) {
      return false;
    }

    authStore.setIsLoading(true);
    authStore.setError(null);

    try {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000';
      // Remove /api if it exists since we're adding it
      const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        authStore.setError(data.message || 'Registration failed');
        return false;
      }

      if (data.data?.user && data.data?.accessToken) {
        authStore.setUser(data.data.user);
        authStore.setTokens(data.data.accessToken, data.data.refreshToken || data.data.accessToken);
        return true;
      }

      authStore.setError('Invalid response from server');
      return false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      authStore.setError(errorMessage);
      return false;
    } finally {
      authStore.setIsLoading(false);
    }
  };

  // Simple logout function
  const logout = async (): Promise<void> => {
    authStore.clearTokens();
  };

  const contextValue: AuthContextType = {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    loading: authStore.isLoading, // Alias for compatibility
    error: authStore.error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext():
  | AuthContextType
  | {
      user: null;
      isAuthenticated: false;
      isLoading: false;
      loading: false;
      error: null;
      login: () => Promise<boolean>;
      register: () => Promise<boolean>;
      logout: () => Promise<void>;
    } {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe default for SSR
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loading: false,
      error: null,
      login: async () => false,
      register: async () => false,
      logout: async () => {},
    };
  }
  return context;
}

// Export both hooks for compatibility
export { useAuthContext as useAuth };
