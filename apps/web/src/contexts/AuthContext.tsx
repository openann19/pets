'use client';

import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { _useAuthStore as useAuthStore } from '../stores/auth-store';
import { api } from '../services/api';
import { toCoreUser, type LegacyWebUser } from '@pawfectmatch/core';
import type { User } from '@pawfectmatch/core';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    clearTokens,
    setIsLoading,
    setError,
  } = useAuthStore();

  // Ensure ApiService has tokens after hydration
  const { accessToken, refreshToken } = useAuthStore.getState();
  useEffect(() => {
    if (accessToken) {
      api.setToken(accessToken, refreshToken ?? undefined);
    }
  }, [accessToken, refreshToken]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.login(email, password);

      setTokens(response.token, response.refreshToken);
      setUser(toCoreUser(response.user as LegacyWebUser));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.register({ email, password, name: `${firstName} ${lastName}` });

      setTokens(response.token, response.refreshToken);
      setUser(toCoreUser(response.user as LegacyWebUser));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
    } catch (_error) {
      // Continue with logout even if API call fails
    } finally {
      clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
