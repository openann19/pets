import { useCallback, useState } from 'react';
import { aiAnimations, gestureAnimations, premiumAnimations } from '../theme/animations';
import { usePrefersReducedMotion } from './useMediaQuery';

type AnimationPreset = 'scale' | 'slide' | 'fade' | 'bounce' | 'instant' | 'premium' | 'gesture' | 'ai';

interface AnimationStyles {
  scaleTransition: string;
  slideVerticalTransition: string;
  slideHorizontalTransition: string;
  fadeTransition: string;
  bounceTransition: string;
  fadeScaleTransition: string;
  enterFromTop: string;
  enterFromBottom: string;
  enterFromLeft: string;
  enterFromRight: string;
  zoomIn: string;
  zoomOut: string;
}

interface AnimationTiming {
  fast: number;
  normal: number;
  slow: number;
}

interface AnimationHookReturn {
  styles: AnimationStyles;
  timing: AnimationTiming;
  animate: (preset: AnimationPreset, callback?: () => void) => void;
  currentAnimation: AnimationPreset | null;
  getAnimationClass: (base: string, animating: string) => string;
  // Enhanced animation methods
  animatePremium: (type: 'micro' | 'transition' | 'celebration', variant?: string, callback?: () => void) => void;
  animateGesture: (direction: 'left' | 'right' | 'up' | 'down', callback?: () => void) => void;
  animateAI: (type: 'analysis' | 'result', score?: number, callback?: () => void) => void;
}

/**
 * A hook for managing animation states and styles
 * Provides consistent animation patterns across the application
 */
export const useAnimation = (): AnimationHookReturn => {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationPreset | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Animation styles that can be applied to components
  const styles = {
    // Scale transitions
    scaleTransition: 'transform transition-all duration-300 ease-out',
    
    // Slide transitions
    slideVerticalTransition: 'transform transition-all duration-300 ease-out',
    slideHorizontalTransition: 'transform transition-all duration-300 ease-out',
    
    // Fade transitions
    fadeTransition: 'opacity transition-opacity duration-300 ease-out',
    
    // Bounce transitions
    bounceTransition: 'transform transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Combined effects
    fadeScaleTransition: 'opacity transform transition-all duration-300 ease-out',
    
    // Animation classes
    enterFromTop: 'animate-enter-from-top',
    enterFromBottom: 'animate-enter-from-bottom',
    enterFromLeft: 'animate-enter-from-left',
    enterFromRight: 'animate-enter-from-right',
    zoomIn: 'animate-zoom-in',
    zoomOut: 'animate-zoom-out',
  };

  // Animation timing configuration
  const timing = {
    fast: 150,
    normal: 300,
    slow: 500,
  };

  /**
   * Applies an animation preset
   */
  const animate = useCallback((preset: AnimationPreset, callback?: () => void): void => {
    // Skip animation if user prefers reduced motion, except for 'instant'
    if (prefersReducedMotion && preset !== 'instant') {
      if (callback) callback();
      return;
    }
    
    setCurrentAnimation(preset);
    
    // Reset animation state after animation completes
    if (preset !== 'instant') {
      const duration = preset === 'bounce' ? timing.slow : timing.normal;
      setTimeout(() => {
        if (callback) callback();
        setCurrentAnimation(null);
      }, duration);
    } else if (callback) {
      callback();
    }
  }, [timing.slow, timing.normal, prefersReducedMotion]);

  /**
   * Get CSS class for current animation state
   */
  const getAnimationClass = useCallback((base: string, animating: string): string => currentAnimation ? animating : base, [currentAnimation]);

  /**
   * Premium animations available to all users
   */
  const animatePremium = useCallback((
    type: 'micro' | 'transition' | 'celebration',
    variant?: string,
    callback?: () => void
  ): void => {
    if (prefersReducedMotion) {
      if (callback) callback();
      return;
    }
    
    setCurrentAnimation('premium');
    
    // Get animation config based on type and variant
    let duration = 300;
    
    if (type === 'micro' && variant !== undefined && variant !== null && variant !== '') {
      const microAnimations = premiumAnimations.worldClass.micro;
      if (variant === 'button' || variant === 'card' || variant === 'input') {
        duration = microAnimations[variant].duration;
      }
    } else if (type === 'transition' && variant !== undefined && variant !== null && variant !== '') {
      const transitionAnimations = premiumAnimations.worldClass.transitions;
      if (variant === 'fade' || variant === 'slide' || variant === 'scale') {
        duration = transitionAnimations[variant].duration;
      }
    } else if (type === 'celebration' && variant !== undefined && variant !== null && variant !== '') {
      const celebrationAnimations = premiumAnimations.worldClass.celebrations;
      if (variant === 'success' || variant === 'match' || variant === 'achievement') {
        duration = celebrationAnimations[variant].duration;
      }
    }
    
    setTimeout(() => {
      if (callback) callback();
      setCurrentAnimation(null);
    }, duration);
  }, [prefersReducedMotion]);

  /**
   * Gesture-based animations
   */
  const animateGesture = useCallback((
    direction: 'left' | 'right' | 'up' | 'down',
    callback?: () => void
  ): void => {
    if (prefersReducedMotion) {
      if (callback) callback();
      return;
    }
    
    setCurrentAnimation('gesture');
    
    const gestureConfig = gestureAnimations.swipe[direction];
    setTimeout(() => {
      if (callback) callback();
      setCurrentAnimation(null);
    }, gestureConfig.duration);
  }, [prefersReducedMotion]);

  /**
   * AI-powered animations based on matching scores
   */
  const animateAI = useCallback((
    type: 'analysis' | 'result',
    score?: number,
    callback?: () => void
  ): void => {
    if (prefersReducedMotion) {
      if (callback) callback();
      return;
    }
    
    setCurrentAnimation('ai');
    
    let duration = 400;
    if (type === 'result' && score !== undefined) {
      if (score >= 80) {
        duration = aiAnimations.matching.result.high.duration;
      } else if (score >= 60) {
        duration = aiAnimations.matching.result.medium.duration;
      } else {
        duration = aiAnimations.matching.result.low.duration;
      }
    } else if (type === 'analysis') {
      duration = aiAnimations.matching.analysis.duration;
    }
    
    setTimeout(() => {
      if (callback) callback();
      setCurrentAnimation(null);
    }, duration);
  }, [prefersReducedMotion]);

  return {
    styles,
    timing,
    animate,
    currentAnimation,
    getAnimationClass,
    animatePremium,
    animateGesture,
    animateAI
  };
};

export default useAnimation;
