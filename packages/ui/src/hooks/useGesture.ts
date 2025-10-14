/**
 * Enhanced Gesture Support Hook for PawfectMatch
 * Provides swipe, pinch, and tap gesture detection with subscription-aware effects
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { premiumAnimations } from '../theme/animations';
import { useAnimation } from './useAnimation';

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
  swipeThreshold?: number;
  velocityThreshold?: number;
  enableHaptic?: boolean;
  enableSound?: boolean;
}

interface GestureState {
  isSwiping: boolean;
  isPinching: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  scale: number;
}

export function useGesture(ref: React.RefObject<HTMLElement>, options: GestureOptions) {
  const [gestureState, setGestureState] = useState<GestureState>({
    isSwiping: false,
    isPinching: false,
    direction: null,
    velocity: 0,
    scale: 1,
  });

  const { animateGesture } = useAnimation();
  
  // Touch tracking refs
  const startPos = useRef({ x: 0, y: 0, time: 0 });
  const currentPos = useRef({ x: 0, y: 0, time: 0 });
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const initialDistance = useRef(0);
  const lastTapTime = useRef(0);
  
  const threshold = options.swipeThreshold || 50;
  const velocityThreshold = options.velocityThreshold || 0.3;

  // Haptic feedback (if available)
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!options.enableHaptic) return;
    
    if ('vibrate' in navigator) {
      const patterns = premiumAnimations.gestures.haptic;
      navigator.vibrate(patterns[intensity]);
    }
  }, [options.enableHaptic]);

  // Sound feedback (if available)
  const triggerSound = useCallback((type: 'swipe' | 'tap' | 'success' = 'swipe') => {
    if (!options.enableSound) return;
    
    // Create audio context for procedural sound generation
    try {
      const audioContext = new (window.AudioContext || (window as unknown).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = {
        swipe: 800,
        tap: 400,
        success: 1200,
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio context is not available
    }
  }, [options.enableSound]);

  // Calculate velocity between two points
  const calculateVelocity = useCallback((start: typeof startPos.current, end: typeof currentPos.current) => {
    const deltaTime = end.time - start.time;
    if (deltaTime === 0) return 0;
    
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    return distance / deltaTime;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    startPos.current = { x: touch.clientX, y: touch.clientY, time: now };
    currentPos.current = { x: touch.clientX, y: touch.clientY, time: now };
    lastPos.current = { x: touch.clientX, y: touch.clientY, time: now };
    
    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      initialDistance.current = distance;
      
      setGestureState(prev => ({
        ...prev,
        isPinching: true,
        scale: 1,
      }));
    } else {
      setGestureState(prev => ({
        ...prev,
        isSwiping: true,
        isPinching: false,
        direction: null,
        velocity: 0,
      }));
    }
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    lastPos.current = currentPos.current;
    currentPos.current = { x: touch.clientX, y: touch.clientY, time: now };
    
    if (gestureState.isPinching && e.touches.length === 2) {
      // Handle pinch gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / initialDistance.current;
      
      setGestureState(prev => ({
        ...prev,
        scale,
      }));
      
      if (options.onPinch) {
        options.onPinch(scale);
      }
    } else if (gestureState.isSwiping) {
      // Handle swipe gesture
      const deltaX = currentPos.current.x - startPos.current.x;
      const deltaY = currentPos.current.y - startPos.current.y;
      const velocity = calculateVelocity(startPos.current, currentPos.current);
      
      // Determine direction
      let direction: 'left' | 'right' | 'up' | 'down' | null = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      
      setGestureState(prev => ({
        ...prev,
        direction,
        velocity,
      }));
      
      // Apply visual feedback for all users
      if (ref.current) {
        const element = ref.current;
        const rotate = deltaX * 0.1;
        const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200);
        
        element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${rotate}deg)`;
        element.style.opacity = opacity.toString();
        element.style.transition = 'none';
      }
    }
  }, [gestureState.isSwiping, gestureState.isPinching, options, ref, calculateVelocity]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const now = Date.now();
    const deltaX = currentPos.current.x - startPos.current.x;
    const deltaY = currentPos.current.y - startPos.current.y;
    const velocity = calculateVelocity(startPos.current, currentPos.current);
    
    // Reset visual feedback
    if (ref.current) {
      const element = ref.current;
      element.style.transform = '';
      element.style.opacity = '';
      element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    }
    
    // Handle tap gestures
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const timeSinceLastTap = now - lastTapTime.current;
      
      if (timeSinceLastTap < 300) {
        // Double tap
        triggerHaptic('light');
        triggerSound('tap');
        options.onDoubleTap?.();
      } else {
        // Single tap
        triggerHaptic('light');
        triggerSound('tap');
        options.onTap?.();
      }
      
      lastTapTime.current = now;
    }
    
    // Handle swipe gestures
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      const {direction} = gestureState;
      
      if (direction && velocity > velocityThreshold) {
        // Trigger haptic feedback
        triggerHaptic('medium');
        triggerSound('swipe');
        
        // Animate gesture
        animateGesture(direction, () => {
          // Call appropriate handler
          switch (direction) {
            case 'left':
              options.onSwipeLeft?.();
              break;
            case 'right':
              options.onSwipeRight?.();
              break;
            case 'up':
              options.onSwipeUp?.();
              break;
            case 'down':
              options.onSwipeDown?.();
              break;
          }
        });
      }
    }
    
    // Reset gesture state
    setGestureState({
      isSwiping: false,
      isPinching: false,
      direction: null,
      velocity: 0,
      scale: 1,
    });
  }, [gestureState.direction, options, ref, threshold, velocityThreshold, calculateVelocity, animateGesture, triggerHaptic, triggerSound]);

  // Set up event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gestureState,
    triggerHaptic,
    triggerSound,
  };
}

export default useGesture;
