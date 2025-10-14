import { useCallback } from 'react';
import { logger } from '../../../web/src/services/logger';

export interface HapticFeedbackConfig {
  /**
   * Whether haptic feedback is enabled
   */
  enabled?: boolean;
  /**
   * Default intensity for haptic feedback
   */
  intensity?: 'light' | 'medium' | 'heavy';
  /**
   * Whether to respect system preferences
   */
  respectSystemPreferences?: boolean;
}

export interface HapticFeedbackActions {
  /**
   * Light haptic feedback
   */
  light: () => void;
  /**
   * Medium haptic feedback
   */
  medium: () => void;
  /**
   * Heavy haptic feedback
   */
  heavy: () => void;
  /**
   * Success haptic feedback
   */
  success: () => void;
  /**
   * Error haptic feedback
   */
  error: () => void;
  /**
   * Warning haptic feedback
   */
  warning: () => void;
  /**
   * Selection haptic feedback
   */
  selection: () => void;
  /**
   * Impact haptic feedback
   */
  impact: (intensity?: 'light' | 'medium' | 'heavy') => void;
  /**
   * Notification haptic feedback
   */
  notification: (type?: 'success' | 'warning' | 'error') => void;
}

/**
 * Enhanced haptic feedback hook providing consistent haptic patterns
 * Supports both web and mobile platforms with fallback handling
 *
 * Usage:
 *   const { success, error, selection } = useHapticFeedback();
 *   success(); // Light haptic feedback
 *   error(); // Heavy haptic feedback
 */
export const useHapticFeedback = (config: HapticFeedbackConfig = {}): HapticFeedbackActions => {
  const {
    enabled = true,
    intensity = 'medium',
    respectSystemPreferences = true
  } = config;

  // Check if haptic feedback is supported
  const isSupported = useCallback(() => {
    if (!enabled) return false;
    
    // Check for various haptic feedback APIs
    return !!(
      'vibrate' in navigator ||
      'hapticFeedback' in navigator ||
      (navigator as unknown).vibrate ||
      (window as unknown).DeviceMotionEvent
    );
  }, [enabled]);

  // Check system preferences
  const shouldUseHaptic = useCallback(() => {
    if (!isSupported()) return false;
    
    if (respectSystemPreferences) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return false;
    }
    
    return true;
  }, [isSupported, respectSystemPreferences]);

  // Base haptic feedback function
  const vibrate = useCallback((pattern: number | number[]) => {
    if (!shouldUseHaptic()) return;
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      logger.warn('Haptic feedback failed', { error });
    }
  }, [shouldUseHaptic]);

  // Light haptic feedback
  const light = useCallback(() => {
    vibrate(50);
  }, [vibrate]);

  // Medium haptic feedback
  const medium = useCallback(() => {
    vibrate(100);
  }, [vibrate]);

  // Heavy haptic feedback
  const heavy = useCallback(() => {
    vibrate(200);
  }, [vibrate]);

  // Success haptic feedback (light double tap)
  const success = useCallback(() => {
    vibrate([50, 50, 50]);
  }, [vibrate]);

  // Error haptic feedback (heavy triple tap)
  const error = useCallback(() => {
    vibrate([100, 50, 100, 50, 100]);
  }, [vibrate]);

  // Warning haptic feedback (medium double tap)
  const warning = useCallback(() => {
    vibrate([75, 50, 75]);
  }, [vibrate]);

  // Selection haptic feedback (very light)
  const selection = useCallback(() => {
    vibrate(25);
  }, [vibrate]);

  // Impact haptic feedback
  const impact = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    switch (intensity) {
      case 'light':
        light();
        break;
      case 'medium':
        medium();
        break;
      case 'heavy':
        heavy();
        break;
    }
  }, [light, medium, heavy]);

  // Notification haptic feedback
  const notification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    switch (type) {
      case 'success':
        success();
        break;
      case 'warning':
        warning();
        break;
      case 'error':
        error();
        break;
    }
  }, [success, warning, error]);

  return {
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    selection,
    impact,
    notification
  };
};

export default useHapticFeedback;
