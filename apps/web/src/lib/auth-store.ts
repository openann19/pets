import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ 
          accessToken, 
          refreshToken,
          isAuthenticated: true 
        });
        
        // Store tokens in localStorage for API calls
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          // Also set cookies for middleware route protection
          const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
            document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
          };
          setCookie('auth-token', accessToken, 24 * 60 * 60);
          setCookie('accessToken', accessToken, 24 * 60 * 60);
          if (refreshToken) setCookie('refreshToken', refreshToken, 7 * 24 * 60 * 60);

          // Sync with API service
          try {
            const { api } = require('../services/api');
            api.setToken(accessToken, refreshToken);
          } catch (error) {
            // Ignore if API service not available
          }
        }
      },

      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Clear cookies used by middleware
          const clearCookie = (name: string) => {
            document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
          };
          clearCookie('auth-token');
          clearCookie('accessToken');
          clearCookie('refreshToken');
        }
      },

      initializeAuth: () => {
        // Check if we have stored tokens on mount
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
          const storedRefreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');
          
          if (storedToken) {
            // Verify token is still valid (you can add API call here)
            set({ 
              accessToken: storedToken,
              refreshToken: storedRefreshToken,
              isAuthenticated: true 
            });

            // Ensure cookies are present for middleware
            const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
              document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
            };
            setCookie('auth-token', storedToken, 24 * 60 * 60);
            setCookie('accessToken', storedToken, 24 * 60 * 60);

            // Sync with API service
            try {
              const { api } = require('../services/api');
              api.setToken(storedToken, storedRefreshToken);
            } catch (error) {
              // Ignore if API service not available
            }
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
