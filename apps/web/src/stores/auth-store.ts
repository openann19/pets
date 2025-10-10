import { create } from 'zustand';
import { User } from '@pawfectmatch/core';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setTokens: (accessToken, refreshToken) => set({ 
    accessToken, 
    refreshToken, 
    isAuthenticated: true 
  }),
  
  clearTokens: () => set({ 
    accessToken: null, 
    refreshToken: null, 
    user: null, 
    isAuthenticated: false 
  }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));
