import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../../../web/src/services/logger';

export interface MobileOptimizationConfig {
  /**
   * Whether to enable touch optimization
   */
  enableTouchOptimization?: boolean;
  /**
   * Whether to enable gesture handling
   */
  enableGestureHandling?: boolean;
  /**
   * Whether to enable viewport optimization
   */
  enableViewportOptimization?: boolean;
  /**
   * Whether to enable performance monitoring
   */
  enablePerformanceMonitoring?: boolean;
  /**
   * Whether to enable battery optimization
   */
  enableBatteryOptimization?: boolean;
}

export interface MobileOptimizationState {
  /**
   * Whether the device is mobile
   */
  isMobile: boolean;
  /**
   * Whether the device supports touch
   */
  supportsTouch: boolean;
  /**
   * Current viewport dimensions
   */
  viewport: { width: number; height: number };
  /**
   * Whether the device is in portrait mode
   */
  isPortrait: boolean;
  /**
   * Whether the device is in landscape mode
   */
  isLandscape: boolean;
  /**
   * Whether the device has a notch
   */
  hasNotch: boolean;
  /**
   * Whether the device is low-end
   */
  isLowEndDevice: boolean;
  /**
   * Current battery level (if available)
   */
  batteryLevel?: number;
  /**
   * Whether the device is charging
   */
  isCharging?: boolean;
}

export interface MobileOptimizationActions {
  /**
   * Get optimized touch target size
   */
  getTouchTargetSize: (baseSize: number) => number;
  /**
   * Get optimized gesture threshold
   */
  getGestureThreshold: (baseThreshold: number) => number;
  /**
   * Get optimized animation duration
   */
  getOptimizedDuration: (baseDuration: number) => number;
  /**
   * Get optimized image quality
   */
  getOptimizedImageQuality: (baseQuality: number) => number;
  /**
   * Check if feature should be enabled
   */
  shouldEnableFeature: (feature: string) => boolean;
  /**
   * Get performance-optimized props
   */
  getOptimizedProps: (baseProps: unknown) => any;
  /**
   * Handle touch events
   */
  handleTouch: (event: TouchEvent) => void;
  /**
   * Handle gesture events
   */
  handleGesture: (event: unknown) => void;
}

/**
 * Enhanced mobile optimization hook for better mobile UX
 * Provides touch optimization, gesture handling, and performance monitoring
 *
 * Usage:
 *   const { isMobile, getTouchTargetSize, shouldEnableFeature } = useMobileOptimization();
 *   const touchSize = getTouchTargetSize(40);
 *   const enableAnimations = shouldEnableFeature('animations');
 */
export const useMobileOptimization = (config: MobileOptimizationConfig = {}): MobileOptimizationState & MobileOptimizationActions => {
  const {
    enableTouchOptimization = true,
    enableGestureHandling = true,
    enableViewportOptimization = true,
    enablePerformanceMonitoring = false,
    enableBatteryOptimization = false
  } = config;

  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    supportsTouch: false,
    viewport: { width: 0, height: 0 },
    isPortrait: true,
    isLandscape: false,
    hasNotch: false,
    isLowEndDevice: false,
    batteryLevel: undefined,
    isCharging: undefined
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gestureRef = useRef<any>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const {userAgent} = navigator;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setState(prev => ({
        ...prev,
        isMobile,
        supportsTouch
      }));
    };

    checkMobile();
  }, []);

  // Detect viewport dimensions
  useEffect(() => {
    if (!enableViewportOptimization) return;

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = width > height;
      
      // Detect notch (iOS devices)
      const hasNotch = isMobile && (
        window.screen.width === 375 && window.screen.height === 812 || // iPhone X, XS, 11 Pro
        window.screen.width === 414 && window.screen.height === 896 || // iPhone XR, XS Max, 11, 11 Pro Max
        window.screen.width === 390 && window.screen.height === 844 || // iPhone 12, 12 Pro
        window.screen.width === 428 && window.screen.height === 926     // iPhone 12 Pro Max
      );

      setState(prev => ({
        ...prev,
        viewport: { width, height },
        isPortrait,
        isLandscape,
        hasNotch
      }));
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [enableViewportOptimization, state.isMobile]);

  // Detect device performance
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const checkPerformance = () => {
      // Check hardware concurrency
      const cores = navigator.hardwareConcurrency || 1;
      
      // Check memory (if available)
      const memory = (navigator as unknown).deviceMemory || 4;
      
      // Check connection (if available)
      const {connection} = (navigator as unknown);
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.saveData
      );

      const isLowEndDevice = cores < 4 || memory < 4 || isSlowConnection;

      setState(prev => ({
        ...prev,
        isLowEndDevice
      }));
    };

    checkPerformance();
  }, [enablePerformanceMonitoring]);

  // Monitor battery status
  useEffect(() => {
    if (!enableBatteryOptimization) return;

    const monitorBattery = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as unknown).getBattery();
          
          const updateBatteryStatus = () => {
            setState(prev => ({
              ...prev,
              batteryLevel: battery.level,
              isCharging: battery.charging
            }));
          };

          updateBatteryStatus();
          battery.addEventListener('levelchange', updateBatteryStatus);
          battery.addEventListener('chargingchange', updateBatteryStatus);

          return () => {
            battery.removeEventListener('levelchange', updateBatteryStatus);
            battery.removeEventListener('chargingchange', updateBatteryStatus);
          };
        }
      } catch (error) {
        logger.warn('Battery API not supported', { error });
      }
    };

    monitorBattery();
  }, [enableBatteryOptimization]);

  // Get optimized touch target size
  const getTouchTargetSize = useCallback((baseSize: number): number => {
    if (!enableTouchOptimization) return baseSize;
    
    // Minimum touch target size should be 44px (Apple HIG) or 48dp (Material Design)
    const minSize = 44;
    return Math.max(baseSize, minSize);
  }, [enableTouchOptimization]);

  // Get optimized gesture threshold
  const getGestureThreshold = useCallback((baseThreshold: number): number => {
    if (!enableGestureHandling) return baseThreshold;
    
    // Adjust threshold based on device performance
    const performanceFactor = state.isLowEndDevice ? 1.5 : 1;
    return baseThreshold * performanceFactor;
  }, [enableGestureHandling, state.isLowEndDevice]);

  // Get optimized animation duration
  const getOptimizedDuration = useCallback((baseDuration: number): number => {
    // Reduce duration on low-end devices
    const performanceFactor = state.isLowEndDevice ? 0.7 : 1;
    return baseDuration * performanceFactor;
  }, [state.isLowEndDevice]);

  // Get optimized image quality
  const getOptimizedImageQuality = useCallback((baseQuality: number): number => {
    // Reduce quality on low-end devices or slow connections
    if (state.isLowEndDevice) {
      return Math.max(0.5, baseQuality * 0.8);
    }
    return baseQuality;
  }, [state.isLowEndDevice]);

  // Check if feature should be enabled
  const shouldEnableFeature = useCallback((feature: string): boolean => {
    switch (feature) {
      case 'animations':
        return !state.isLowEndDevice;
      case 'gestures':
        return state.supportsTouch && enableGestureHandling;
      case 'haptic':
        return state.isMobile && 'vibrate' in navigator;
      case 'battery':
        return enableBatteryOptimization && 'getBattery' in navigator;
      default:
        return true;
    }
  }, [state.isLowEndDevice, state.supportsTouch, state.isMobile, enableGestureHandling, enableBatteryOptimization]);

  // Get performance-optimized props
  const getOptimizedProps = useCallback((baseProps: unknown) => {
    const optimizedProps = { ...baseProps };

    // Optimize touch targets
    if (optimizedProps.size) {
      optimizedProps.size = getTouchTargetSize(optimizedProps.size);
    }

    // Optimize animation duration
    if (optimizedProps.duration) {
      optimizedProps.duration = getOptimizedDuration(optimizedProps.duration);
    }

    // Disable animations on low-end devices
    if (state.isLowEndDevice && optimizedProps.animate) {
      optimizedProps.animate = false;
    }

    return optimizedProps;
  }, [getTouchTargetSize, getOptimizedDuration, state.isLowEndDevice]);

  // Handle touch events
  const handleTouch = useCallback((event: TouchEvent) => {
    if (!enableTouchOptimization) return;

    const touch = event.touches[0];
    if (!touch) return;

    switch (event.type) {
      case 'touchstart':
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
        break;
      case 'touchend':
        if (touchStartRef.current) {
          const deltaX = touch.clientX - touchStartRef.current.x;
          const deltaY = touch.clientY - touchStartRef.current.y;
          const deltaTime = Date.now() - touchStartRef.current.time;
          
          // Detect tap
          if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
            // Handle tap
            event.target?.dispatchEvent(new Event('tap', { bubbles: true }));
          }
        }
        touchStartRef.current = null;
        break;
    }
  }, [enableTouchOptimization]);

  // Handle gesture events
  const handleGesture = useCallback((event: unknown) => {
    if (!enableGestureHandling) return;

    // Handle gesture events
    switch (event.type) {
      case 'gesturestart':
        gestureRef.current = { start: event.scale };
        break;
      case 'gesturechange':
        if (gestureRef.current) {
          const scale = event.scale / gestureRef.current.start;
          // Handle pinch zoom
          event.target?.dispatchEvent(new CustomEvent('pinch', { 
            detail: { scale },
            bubbles: true 
          }));
        }
        break;
      case 'gestureend':
        gestureRef.current = null;
        break;
    }
  }, [enableGestureHandling]);

  return {
    ...state,
    getTouchTargetSize,
    getGestureThreshold,
    getOptimizedDuration,
    getOptimizedImageQuality,
    shouldEnableFeature,
    getOptimizedProps,
    handleTouch,
    handleGesture
  };
};

export default useMobileOptimization;
