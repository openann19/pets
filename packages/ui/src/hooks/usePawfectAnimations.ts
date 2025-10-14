import { useCallback, useState } from 'react';
import { useMemoryLeakDetection } from './useMemoryLeakDetection';

interface AnimationConfig {
  type: 'fade' | 'scale' | 'slide' | 'bounce' | 'pulse' | 'shake' | 'flip' | 'rotate' | 'morph' | 'glow' | 'wave' | 'confetti';
  duration?: number;
  delay?: number;
  easing?: string;
  onComplete?: (() => void) | undefined;
}

export function usePawfectAnimations() {
  const [animatingElements, setAnimatingElements] = useState<Record<string, boolean>>({});
  const { trackTimeout, trackAnimationFrame } = useMemoryLeakDetection('usePawfectAnimations');
  
  const triggerAnimation = useCallback((
    elementId: string,
    config: AnimationConfig
  ) => {
    // Set animation state
    setAnimatingElements(prev => ({ ...prev, [elementId]: true }));
    
    // Apply CSS classes based on animation type
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID ${elementId} not found for animation`);
      return;
    }
    
    // Add animation class
    element.classList.add(`animate-${config.type}`);
    
    // Set custom properties for duration and easing
    if (config.duration) {
      element.style.setProperty('--animation-duration', `${config.duration}ms`);
    }
    
    if (config.easing) {
      element.style.setProperty('--animation-easing', config.easing);
    }
    
    // Remove animation class after completion
    const timeout = config.duration || 300;
    const timeoutId = setTimeout(() => {
      element.classList.remove(`animate-${config.type}`);
      setAnimatingElements(prev => ({ ...prev, [elementId]: false }));
      
      // Call onComplete if provided
      if (config.onComplete) {
        config.onComplete();
      }
    }, timeout);
    
    // Track timeout for memory leak detection
    trackTimeout(timeoutId as unknown as NodeJS.Timeout);
  }, [trackTimeout]);
  
  // Animation frame based animation for smoother performance
  const triggerAnimationFrameAnimation = useCallback((
    elementId: string,
    config: AnimationConfig
  ) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID ${elementId} not found for animation`);
      return;
    }
    
    let start: number | null = null;
    const duration = config.duration || 300;
    
    // Store initial styles to reset after animation
    const initialOpacity = element.style.opacity || '';
    const initialTransform = element.style.transform || '';
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min(timestamp - start, duration);
      const progressRatio = progress / duration;
      
      // Apply animation based on progress
      switch (config.type) {
        case 'fade':
          element.style.opacity = `${progressRatio}`;
          break;
        case 'scale':
          const scale = 0.5 + 0.5 * progressRatio;
          element.style.transform = `scale(${scale})`;
          break;
        case 'flip':
          const flipProgress = progressRatio * 360;
          element.style.transform = `perspective(400px) rotateY(${flipProgress}deg)`;
          break;
        case 'rotate':
          const rotateProgress = progressRatio * 360;
          element.style.transform = `rotate(${rotateProgress}deg)`;
          break;
        case 'morph':
          // Morphing animation with changing border-radius
          const borderRadius = Math.abs(Math.sin(progressRatio * Math.PI * 2)) * 50;
          element.style.borderRadius = `${borderRadius}%`;
          break;
        case 'glow':
          // Glow effect with box-shadow
          const glowIntensity = Math.abs(Math.sin(progressRatio * Math.PI));
          element.style.boxShadow = `0 0 ${glowIntensity * 20}px rgba(255, 255, 255, ${glowIntensity}), 0 0 ${glowIntensity * 30}px rgba(128, 0, 128, ${glowIntensity * 0.8})`;
          break;
        case 'wave':
          // Wave animation with vertical movement
          const waveHeight = Math.sin(progressRatio * Math.PI * 2) * 10;
          element.style.transform = `translateY(${waveHeight}px)`;
          break;
        case 'confetti':
          // Confetti effect with rotation and fade
          const confettiRotation = progressRatio * 360;
          const confettiOpacity = 1 - progressRatio;
          const confettiTranslateY = progressRatio * 100;
          element.style.transform = `translateY(${confettiTranslateY}px) rotate(${confettiRotation}deg)`;
          element.style.opacity = `${confettiOpacity}`;
          break;
      }
      
      if (progress < duration) {
        const frameId = requestAnimationFrame(animate);
        trackAnimationFrame(frameId);
      } else {
        // Animation complete - reset styles
        element.style.opacity = initialOpacity;
        element.style.transform = initialTransform;
        element.style.boxShadow = '';
        
        // Call onComplete if provided
        if (config.onComplete) {
          config.onComplete();
        }
      }
    };
    
    const frameId = requestAnimationFrame(animate);
    trackAnimationFrame(frameId);
  }, [trackAnimationFrame]);
  
  return {
    triggerAnimation,
    triggerAnimationFrameAnimation,
    isAnimating: (elementId: string) => animatingElements[elementId] || false
  };
}

export default usePawfectAnimations;
