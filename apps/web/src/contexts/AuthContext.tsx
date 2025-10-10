'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { api } from '../services/api';
import { User } from '../types';

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
    setError 
  } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.login(email, password);
      
      setTokens(response.token, response.refreshToken);
      setUser(response.user as any);
    } catch (error: any) {
      setError(error.message || 'Login failed');
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
      setUser(response.user as any);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
