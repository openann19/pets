import { useCallback, useEffect, useRef } from 'react';

export interface AnimationOptimizationConfig {
  /**
   * Whether to respect reduced motion preferences
   */
  respectReducedMotion?: boolean;
  /**
   * Whether to enable GPU acceleration
   */
  enableGPUAcceleration?: boolean;
  /**
   * Whether to use will-change property
   */
  useWillChange?: boolean;
  /**
   * Whether to enable intersection observer
   */
  enableIntersectionObserver?: boolean;
  /**
   * Whether to enable performance monitoring
   */
  enablePerformanceMonitoring?: boolean;
}

export interface AnimationOptimizationState {
  /**
   * Whether reduced motion is preferred
   */
  prefersReducedMotion: boolean;
  /**
   * Whether animations should be disabled
   */
  animationsDisabled: boolean;
  /**
   * Current frame rate
   */
  frameRate: number;
  /**
   * Whether element is in viewport
   */
  isInViewport: boolean;
}

export interface AnimationOptimizationActions {
  /**
   * Get optimized animation duration
   */
  getOptimizedDuration: (baseDuration: number) => number;
  /**
   * Get optimized animation easing
   */
  getOptimizedEasing: (baseEasing: string) => string;
  /**
   * Apply performance optimizations to element
   */
  optimizeElement: (element: HTMLElement) => void;
  /**
   * Remove performance optimizations from element
   */
  unoptimizeElement: (element: HTMLElement) => void;
  /**
   * Check if animation should run
   */
  shouldAnimate: () => boolean;
  /**
   * Get performance-optimized animation props
   */
  getAnimationProps: (baseProps: unknown) => any;
}

/**
 * Enhanced animation optimization hook for 60fps performance
 * Provides performance monitoring, reduced motion support, and GPU acceleration
 *
 * Usage:
 *   const { getOptimizedDuration, optimizeElement, shouldAnimate } = useAnimationOptimization();
 *   const duration = getOptimizedDuration(1000);
 *   optimizeElement(elementRef.current);
 */
export const useAnimationOptimization = (config: AnimationOptimizationConfig = {}): AnimationOptimizationState & AnimationOptimizationActions => {
  const {
    respectReducedMotion = true,
    enableGPUAcceleration = true,
    useWillChange = true,
    enableIntersectionObserver = true,
    enablePerformanceMonitoring = false
  } = config;

  const stateRef = useRef<AnimationOptimizationState>({
    prefersReducedMotion: false,
    animationsDisabled: false,
    frameRate: 60,
    isInViewport: true
  });

  const frameRateRef = useRef<number>(60);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const measureFrameRate = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastFrameTimeRef.current >= 1000) {
        frameRateRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
        stateRef.current.frameRate = frameRateRef.current;
      }

      animationFrameRef.current = requestAnimationFrame(measureFrameRate);
    };

    animationFrameRef.current = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enablePerformanceMonitoring]);

  // Reduced motion detection
  useEffect(() => {
    if (!respectReducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      stateRef.current.prefersReducedMotion = e.matches;
      stateRef.current.animationsDisabled = e.matches;
      
      // Update CSS custom properties
      if (e.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01s');
        document.documentElement.style.setProperty('--animation-timing', 'linear');
      } else {
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
        document.documentElement.style.setProperty('--animation-timing', 'cubic-bezier(0.4, 0, 0.2, 1)');
      }
    };

    // Initial check
    handleChange(mediaQuery);

    mediaQuery.addEventListener('change', handleChange);
    return () => { mediaQuery.removeEventListener('change', handleChange); };
  }, [respectReducedMotion]);

  // Intersection observer for viewport detection
  useEffect(() => {
    if (!enableIntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stateRef.current.isInViewport = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    // Observe body to track general viewport state
    observer.observe(document.body);

    return () => { observer.disconnect(); };
  }, [enableIntersectionObserver]);

  // Get optimized animation duration
  const getOptimizedDuration = useCallback((baseDuration: number): number => {
    if (stateRef.current.animationsDisabled) return 0;
    
    // Adjust duration based on frame rate
    const frameRateFactor = Math.max(0.5, Math.min(1.5, frameRateRef.current / 60));
    return baseDuration * frameRateFactor;
  }, []);

  // Get optimized animation easing
  const getOptimizedEasing = useCallback((baseEasing: string): string => {
    if (stateRef.current.animationsDisabled) return 'linear';
    
    // Use more performant easing functions
    const optimizedEasing = {
      'ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'linear': 'linear'
    };

    return optimizedEasing[baseEasing as keyof typeof optimizedEasing] || baseEasing;
  }, []);

  // Apply performance optimizations to element
  const optimizeElement = useCallback((element: HTMLElement) => {
    if (!element) return;

    if (enableGPUAcceleration) {
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';
    }

    if (useWillChange) {
      element.style.willChange = 'transform, opacity';
    }

    // Add performance class
    element.classList.add('performance-optimized');
  }, [enableGPUAcceleration, useWillChange]);

  // Remove performance optimizations from element
  const unoptimizeElement = useCallback((element: HTMLElement) => {
    if (!element) return;

    element.style.transform = '';
    element.style.backfaceVisibility = '';
    element.style.perspective = '';
    element.style.willChange = '';

    element.classList.remove('performance-optimized');
  }, []);

  // Check if animation should run
  const shouldAnimate = useCallback((): boolean => !stateRef.current.animationsDisabled && stateRef.current.isInViewport, []);

  // Get performance-optimized animation props
  const getAnimationProps = useCallback((baseProps: unknown) => {
    if (!shouldAnimate()) {
      return {
        ...baseProps,
        duration: 0,
        ease: 'linear'
      };
    }

    return {
      ...baseProps,
      duration: getOptimizedDuration(baseProps.duration || 300),
      ease: getOptimizedEasing(baseProps.ease || 'ease')
    };
  }, [shouldAnimate, getOptimizedDuration, getOptimizedEasing]);

  return {
    ...stateRef.current,
    getOptimizedDuration,
    getOptimizedEasing,
    optimizeElement,
    unoptimizeElement,
    shouldAnimate,
    getAnimationProps
  };
};

export default useAnimationOptimization;
