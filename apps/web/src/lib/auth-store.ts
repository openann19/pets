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
  isInitialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  clearTokens: () => void;
}

// Secure token storage utilities - prioritize HTTP-only cookies
const tokenStorage = {
  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') {
      // Set secure HTTP-only cookie (preferred)
      document.cookie = `accessToken=${token}; Max-Age=${15 * 60}; Path=/; SameSite=Strict; Secure=${location.protocol === 'https:'}`;
      
      // Fallback to localStorage for client-side access (less secure)
      localStorage.setItem('accessToken', token);
    }
  },
  
  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      // Set secure HTTP-only cookie (preferred)
      document.cookie = `refreshToken=${token}; Max-Age=${7 * 24 * 60 * 60}; Path=/; SameSite=Strict; Secure=${location.protocol === 'https:'}`;
      
      // Fallback to localStorage for client-side access (less secure)
      localStorage.setItem('refreshToken', token);
    }
  },
  
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookie first (more secure)
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];
    
    if (cookieValue) return cookieValue;
    
    // Fallback to localStorage
    return localStorage.getItem('accessToken');
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookie first (more secure)
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];
    
    if (cookieValue) return cookieValue;
    
    // Fallback to localStorage
    return localStorage.getItem('refreshToken');
  },
  
  clearAll: () => {
    if (typeof window === 'undefined') return;
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear cookies with secure flags
    const secureFlag = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `accessToken=; Max-Age=0; Path=/; SameSite=Strict${secureFlag}`;
    document.cookie = `refreshToken=; Max-Age=0; Path=/; SameSite=Strict${secureFlag}`;
    document.cookie = `auth-token=; Max-Age=0; Path=/; SameSite=Lax`;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },

      setTokens: (accessToken, refreshToken) => {
        // Update store state
        set({ 
          accessToken, 
          refreshToken: refreshToken || get().refreshToken,
          isAuthenticated: true,
          error: null
        });
        
        // Store tokens in localStorage (single source of truth)
        tokenStorage.setAccessToken(accessToken);
        if (refreshToken) {
          tokenStorage.setRefreshToken(refreshToken);
        }

        // Sync with API service if available
        if (typeof window !== 'undefined') {
          try {
            const apiService = require('../services/api').default;
            if (apiService && apiService.setAuthToken) {
              apiService.setAuthToken(accessToken);
            }
          } catch (error) {
            console.debug('[AuthStore] API service not available for token sync');
          }
        }
      },

      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },
      
      clearTokens: () => {
        tokenStorage.clearAll();
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        });
      },

      logout: () => {
        // Clear all auth state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear all stored tokens
        tokenStorage.clearAll();
      },

      initializeAuth: async () => {
        // Prevent multiple initializations
        const state = get();
        if (state.isInitialized || state.isLoading) {
          return;
        }
        
        set({ isLoading: true, isInitialized: true });
        
        try {
          // Check if we have stored tokens on mount
          if (typeof window !== 'undefined') {
            const storedToken = tokenStorage.getAccessToken();
            const storedRefreshToken = tokenStorage.getRefreshToken();
            
            if (storedToken) {
              // Update state with stored tokens
              set({ 
                accessToken: storedToken,
                refreshToken: storedRefreshToken,
                isAuthenticated: true 
              });

              // Sync with API service
              try {
                const apiService = require('../services/api').default;
                if (apiService && apiService.setAuthToken) {
                  apiService.setAuthToken(storedToken);
                }
                
                // Optionally validate token with backend
                if (apiService && apiService.validateToken) {
                  const isValid = await apiService.validateToken(storedToken);
                  if (!isValid) {
                    get().clearTokens();
                  }
                }
              } catch (error) {
                console.debug('[AuthStore] Could not validate token');
              }
            }
          }
        } catch (error) {
          console.error('[AuthStore] Initialization error:', error);
          set({ error: 'Failed to initialize authentication' });
        } finally {
          set({ isLoading: false });
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
