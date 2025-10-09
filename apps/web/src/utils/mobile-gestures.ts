/**
 * Mobile Gestures Utilities
 * Advanced gesture recognition and handling for mobile devices
 */

import { useCallback, useRef, useState, useEffect } from 'react';

export interface GestureConfig {
  threshold: number;
  velocity: number;
  direction: 'horizontal' | 'vertical' | 'both';
  preventDefault: boolean;
  stopPropagation: boolean;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
  distance: number;
}

export interface PanGesture {
  deltaX: number;
  deltaY: number;
  velocity: { x: number; y: number };
  direction: 'left' | 'right' | 'up' | 'down' | 'none';
}

export interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
}

/**
 * Hook for swipe gesture detection
 */
export function useSwipeGesture(
  onSwipe: (gesture: SwipeGesture) => void,
  config: Partial<GestureConfig> = {}
) {
  const defaultConfig: GestureConfig = {
    threshold: 50,
    velocity: 0.3,
    direction: 'both',
    preventDefault: true,
    stopPropagation: false,
  };

  const finalConfig = { ...defaultConfig, ...config };
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    if (finalConfig.preventDefault) {
      void e.preventDefault();
    }
    if (finalConfig.stopPropagation) {
      void e.stopPropagation();
    }
  }, [finalConfig]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;

    const touch = e.changedTouches[0];
    if (!touch) return;
    
    const endTime = Date.now();
    const duration = endTime - touchStartRef.current.time;
    
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    if (distance < finalConfig.threshold || velocity < finalConfig.velocity) {
      touchStartRef.current = null;
      return;
    }

    let direction: 'left' | 'right' | 'up' | 'down';
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (finalConfig.direction === 'vertical') return;
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      if (finalConfig.direction === 'horizontal') return;
      direction = deltaY > 0 ? 'down' : 'up';
    }

    const gesture: SwipeGesture = {
      direction,
      distance,
      velocity,
      duration,
    };

    onSwipe(gesture);
    touchStartRef.current = null;

    if (finalConfig.preventDefault) {
      void e.preventDefault();
    }
    if (finalConfig.stopPropagation) {
      void e.stopPropagation();
    }
  }, [finalConfig, onSwipe]);

  const attachGestures = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    void element.addEventListener('touchstart', handleTouchStart, { passive: false });
    void element.addEventListener('touchend', handleTouchEnd, { passive: false });
  }, [handleTouchStart, handleTouchEnd]);

  const detachGestures = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
      elementRef.current = null;
    }
  }, [handleTouchStart, handleTouchEnd]);

  useEffect(() => {
    return () => {
      detachGestures();
    };
  }, [detachGestures]);

  return { attachGestures, detachGestures };
}

/**
 * Hook for pinch gesture detection
 */
export function usePinchGesture(
  onPinch: (gesture: PinchGesture) => void,
  config: { threshold?: number; preventDefault?: boolean } = {}
) {
  const { threshold = 0.1, preventDefault = true } = config;
  const touchStartRef = useRef<{ touches: TouchList; distance: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2 || !touches[0] || !touches[1]) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenter = useCallback((touches: TouchList) => {
    if (touches.length < 2 || !touches[0] || !touches[1]) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    
    const distance = getDistance(e.touches);
    touchStartRef.current = {
      touches: e.touches,
      distance,
    };

    if (preventDefault) {
      void e.preventDefault();
    }
  }, [getDistance, preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 2) return;

    const currentDistance = getDistance(e.touches);
    const scale = currentDistance / touchStartRef.current.distance;
    const center = getCenter(e.touches);

    if (Math.abs(scale - 1) > threshold) {
      const gesture: PinchGesture = {
        scale,
        center,
        distance: currentDistance,
      };

      onPinch(gesture);
    }

    if (preventDefault) {
      void e.preventDefault();
    }
  }, [getDistance, getCenter, threshold, onPinch, preventDefault]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    touchStartRef.current = null;
  }, []);

  const attachGestures = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    void element.addEventListener('touchstart', handleTouchStart, { passive: false });
    void element.addEventListener('touchmove', handleTouchMove, { passive: false });
    void element.addEventListener('touchend', handleTouchEnd, { passive: false });
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const detachGestures = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
      elementRef.current = null;
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      detachGestures();
    };
  }, [detachGestures]);

  return { attachGestures, detachGestures };
}

/**
 * Hook for pan gesture detection
 */
export function usePanGesture(
  onPan: (gesture: PanGesture) => void,
  config: { threshold?: number; preventDefault?: boolean } = {}
) {
  const { threshold = 10, preventDefault = true } = config;
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastMoveRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const now = Date.now();
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
    lastMoveRef.current = { x: touch.clientX, y: touch.clientY, time: now };

    if (preventDefault) {
      void e.preventDefault();
    }
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || !lastMoveRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    if (!touch) return;
    
    const now = Date.now();
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (totalDistance < threshold) return;

    const moveDeltaX = touch.clientX - lastMoveRef.current.x;
    const moveDeltaY = touch.clientY - lastMoveRef.current.y;
    const moveTime = now - lastMoveRef.current.time;
    
    const velocityX = moveTime > 0 ? moveDeltaX / moveTime : 0;
    const velocityY = moveTime > 0 ? moveDeltaY / moveTime : 0;

    let direction: 'left' | 'right' | 'up' | 'down' | 'none' = 'none';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    const gesture: PanGesture = {
      deltaX,
      deltaY,
      velocity: { x: velocityX, y: velocityY },
      direction,
    };

    onPan(gesture);
    lastMoveRef.current = { x: touch.clientX, y: touch.clientY, time: now };

    if (preventDefault) {
      void e.preventDefault();
    }
  }, [threshold, onPan, preventDefault]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    lastMoveRef.current = null;
  }, []);

  const attachGestures = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    void element.addEventListener('touchstart', handleTouchStart, { passive: false });
    void element.addEventListener('touchmove', handleTouchMove, { passive: false });
    void element.addEventListener('touchend', handleTouchEnd, { passive: false });
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const detachGestures = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
      elementRef.current = null;
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      detachGestures();
    };
  }, [detachGestures]);

  return { attachGestures, detachGestures };
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  config: { 
    threshold?: number; 
    resistance?: number; 
    maxPullDistance?: number;
    preventDefault?: boolean;
  } = {}
) {
  const {
    threshold = 100,
    resistance = 0.5,
    maxPullDistance = 200,
    preventDefault = true,
  } = config;

  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false,
  });

  const touchStartRef = useRef<{ y: number; scrollTop: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const element = elementRef.current;
    if (!element) return;

    const touch = e.touches[0];
    if (!touch) return;
    
    touchStartRef.current = {
      y: touch.clientY,
      scrollTop: element.scrollTop,
    };

    if (preventDefault) {
      void e.preventDefault();
    }
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;

    const element = elementRef.current;
    if (!element) return;

    const touch = e.touches[0];
    if (!touch) return;
    
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Only trigger pull-to-refresh if at the top of the scroll
    if (element.scrollTop <= 0 && deltaY > 0) {
      const pullDistance = Math.min(deltaY * resistance, maxPullDistance);
      const canRefresh = pullDistance >= threshold;

      setState({
        isPulling: true,
        pullDistance,
        isRefreshing: false,
        canRefresh,
      });

      if (preventDefault) {
        void e.preventDefault();
      }
    }
  }, [threshold, resistance, maxPullDistance, preventDefault]);

  const handleTouchEnd = useCallback(async () => {
    if (!state.isPulling) return;

    if (state.canRefresh && !state.isRefreshing) {
      setState(prev => ({ ...prev, isRefreshing: true, isPulling: false }));
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh failed:', error);
      } finally {
        setState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
          canRefresh: false,
        });
      }
    } else {
      setState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        canRefresh: false,
      });
    }

    touchStartRef.current = null;
  }, [state, onRefresh]);

  const attachGestures = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    void element.addEventListener('touchstart', handleTouchStart, { passive: false });
    void element.addEventListener('touchmove', handleTouchMove, { passive: false });
    void element.addEventListener('touchend', handleTouchEnd, { passive: false });
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const detachGestures = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
      elementRef.current = null;
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      detachGestures();
    };
  }, [detachGestures]);

  return { 
    state, 
    attachGestures, 
    detachGestures,
    setState,
  };
}

/**
 * Hook for long press gesture detection
 */
export function useLongPress(
  onLongPress: () => void,
  config: { delay?: number; preventDefault?: boolean } = {}
) {
  const { delay = 500, preventDefault = true } = config;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    timeoutRef.current = setTimeout(() => {
      onLongPress();
    }, delay);

    if (preventDefault) {
      void e.preventDefault();
    }
  }, [delay, onLongPress, preventDefault]);

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleTouchCancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const attachGestures = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    void element.addEventListener('touchstart', handleTouchStart, { passive: false });
    void element.addEventListener('touchend', handleTouchEnd, { passive: false });
    void element.addEventListener('touchcancel', handleTouchCancel, { passive: false });
  }, [handleTouchStart, handleTouchEnd, handleTouchCancel]);

  const detachGestures = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
      elementRef.current.removeEventListener('touchcancel', handleTouchCancel);
      elementRef.current = null;
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchCancel]);

  useEffect(() => {
    return () => {
      detachGestures();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [detachGestures]);

  return { attachGestures, detachGestures };
}

/**
 * Utility functions for gesture handling
 */
export const gestureUtils = {
  // Prevent default touch behaviors
  preventDefault: (e: TouchEvent) => {
    void e.preventDefault();
  },

  // Stop event propagation
  stopPropagation: (e: TouchEvent) => {
    void e.stopPropagation();
  },

  // Check if device supports touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get touch point from event
  getTouchPoint: (e: TouchEvent, index: number = 0) => {
    if (e.touches.length > index && e.touches[index]) {
      return {
        x: e.touches[index].clientX,
        y: e.touches[index].clientY,
      };
    }
    return null;
  },

  // Calculate distance between two points
  getDistance: (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return void Math.sqrt(dx * dx + dy * dy);
  },

  // Calculate angle between two points
  getAngle: (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  },

  // Add haptic feedback (if supported)
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 20],
      };
      void navigator.vibrate(patterns[type]);
    }
  },
};
