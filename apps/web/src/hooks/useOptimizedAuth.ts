/**
 * 🔐 OPTIMIZED AUTH HOOK
 * Enhanced authentication flow based on Tinder clone optimizations
 * Provides smooth auth experience with premium loading states and error handling
 */

// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';

import { useAuth } from '@/components/providers/AuthProvider';
import { api } from '@/services/api';
import { logger } from '@/services/logger';

interface AuthConfig {
  hapticEnabled?: boolean;
  soundEnabled?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface AuthCallbacks {
  onLoginSuccess?: (user: any) => void;
  onLoginError?: (error: Error) => void;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: Error) => void;
  onRegisterSuccess?: (user: any) => void;
  onRegisterError?: (error: Error) => void;
}

export const useOptimizedAuth = (
  config: AuthConfig = {},
  callbacks: AuthCallbacks = {}
) => {
  const {
    hapticEnabled = true,
    soundEnabled = true,
    autoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = config;

  const {
    onLoginSuccess,
    onLoginError,
    onLogoutSuccess,
    onLogoutError,
    onRegisterSuccess,
    onRegisterError,
  } = callbacks;

  const { user, login, logout, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingStepsRef = useRef<string[]>([
    'Initializing...',
    'Connecting to server...',
    'Authenticating...',
    'Loading profile...',
    'Almost ready...'
  ]);

  // Enhanced haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!hapticEnabled || !('vibrate' in navigator)) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    
    navigator.vibrate(patterns[type]);
  }, [hapticEnabled]);

  // Enhanced sound feedback
  const triggerSound = useCallback((type: 'success' | 'error' | 'loading') => {
    if (!soundEnabled) return;
    
    try {
      const sounds = {
        success: '/sounds/success.mp3',
        error: '/sounds/error.mp3',
        loading: '/sounds/loading.mp3'
      };
      
      const audio = new Audio(sounds[type]);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback to haptic feedback
        triggerHaptic('light');
      });
    } catch (error) {
      triggerHaptic('light');
    }
  }, [soundEnabled, triggerHaptic]);

  // Enhanced loading animation
  const startLoadingAnimation = useCallback(() => {
    let stepIndex = 0;
    
    const updateStep = () => {
      if (stepIndex < loadingStepsRef.current.length) {
        setLoadingStep(loadingStepsRef.current[stepIndex]);
        stepIndex++;
        setTimeout(updateStep, 800);
      }
    };
    
    updateStep();
  }, []);

  // Optimized login with retry logic
  const optimizedLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    startLoadingAnimation();
    triggerSound('loading');

    const attemptLogin = async (attempt = 1): Promise<void> => {
      try {
        const userData = await login(email, password);
        setIsLoading(false);
        setLoadingStep('');
        triggerHaptic('heavy');
        triggerSound('success');
        onLoginSuccess?.(userData);
        logger.info('Login successful', { email, attempt });
      } catch (error) {
        logger.error('Login failed', error);
        
        if (autoRetry && attempt < maxRetries) {
          setRetryCount(attempt);
          setLoadingStep(`Retrying... (${attempt}/${maxRetries})`);
          
          retryTimeoutRef.current = setTimeout(() => {
            attemptLogin(attempt + 1);
          }, retryDelay * attempt);
        } else {
          setIsLoading(false);
          setLoadingStep('');
          setError(error instanceof Error ? error.message : 'Login failed');
          triggerHaptic('heavy');
          triggerSound('error');
          onLoginError?.(error instanceof Error ? error : new Error('Login failed'));
        }
      }
    };

    await attemptLogin();
  }, [
    login,
    autoRetry,
    maxRetries,
    retryDelay,
    startLoadingAnimation,
    triggerHaptic,
    triggerSound,
    onLoginSuccess,
    onLoginError
  ]);

  // Optimized register with enhanced validation
  const optimizedRegister = useCallback(async (userData: {
    email: string;
    password: string;
    name: string;
    petName?: string;
    petBreed?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    startLoadingAnimation();
    triggerSound('loading');

    try {
      // Enhanced validation
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Please fill in all required fields');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!userData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const newUser = await register(userData);
      setIsLoading(false);
      setLoadingStep('');
      triggerHaptic('heavy');
      triggerSound('success');
      onRegisterSuccess?.(newUser);
      logger.info('Registration successful', { email: userData.email });
    } catch (error) {
      setIsLoading(false);
      setLoadingStep('');
      setError(error instanceof Error ? error.message : 'Registration failed');
      triggerHaptic('heavy');
      triggerSound('error');
      onRegisterError?.(error instanceof Error ? error : new Error('Registration failed'));
      logger.error('Registration failed', error);
    }
  }, [
    register,
    startLoadingAnimation,
    triggerHaptic,
    triggerSound,
    onRegisterSuccess,
    onRegisterError
  ]);

  // Optimized logout
  const optimizedLogout = useCallback(async () => {
    setIsLoading(true);
    setLoadingStep('Signing out...');
    triggerSound('loading');

    try {
      await logout();
      setIsLoading(false);
      setLoadingStep('');
      triggerHaptic('medium');
      triggerSound('success');
      onLogoutSuccess?.();
      logger.info('Logout successful');
    } catch (error) {
      setIsLoading(false);
      setLoadingStep('');
      setError(error instanceof Error ? error.message : 'Logout failed');
      triggerHaptic('heavy');
      triggerSound('error');
      onLogoutError?.(error instanceof Error ? error : new Error('Logout failed'));
      logger.error('Logout failed', error);
    }
  }, [
    logout,
    triggerHaptic,
    triggerSound,
    onLogoutSuccess,
    onLogoutError
  ]);

  // Google OAuth login
  const googleLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadingStep('Connecting to Google...');
    triggerSound('loading');

    try {
      // Implement Google OAuth flow
      const userData = await api.auth.googleLogin();
      setIsLoading(false);
      setLoadingStep('');
      triggerHaptic('heavy');
      triggerSound('success');
      onLoginSuccess?.(userData);
      logger.info('Google login successful');
    } catch (error) {
      setIsLoading(false);
      setLoadingStep('');
      setError(error instanceof Error ? error.message : 'Google login failed');
      triggerHaptic('heavy');
      triggerSound('error');
      onLoginError?.(error instanceof Error ? error : new Error('Google login failed'));
      logger.error('Google login failed', error);
    }
  }, [triggerHaptic, triggerSound, onLoginSuccess, onLoginError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    user,
    isLoading,
    error,
    retryCount,
    loadingStep,
    
    // Actions
    login: optimizedLogin,
    register: optimizedRegister,
    logout: optimizedLogout,
    googleLogin,
    clearError,
    
    // Utilities
    triggerHaptic,
    triggerSound,
  };
};
