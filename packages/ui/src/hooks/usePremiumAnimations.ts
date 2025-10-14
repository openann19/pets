import { usePawfectAnimations } from './usePawfectAnimations';

interface AnimationConfig {
  type: 'fade' | 'scale' | 'slide' | 'bounce' | 'pulse' | 'shake' | 'flip' | 'rotate' | 'morph' | 'glow' | 'wave' | 'confetti';
  duration?: number;
  delay?: number;
  easing?: string;
  onComplete?: (() => void) | undefined;
}

/**
 * Hook that provides access to premium animations for all users
 * This enhances the base animation hook with additional premium animations
 */
export function usePremiumAnimations(): {
  premiumAnimations: Record<string, (elementId: string, config?: Partial<AnimationConfig>) => Promise<void>>;
  isAnimating: (elementId: string) => boolean;
} {
  const { triggerAnimation, isAnimating } = usePawfectAnimations();
  
  // All premium animations are now available to everyone
  const premiumAnimations = {
    flip: (elementId: string, config?: { duration?: number; delay?: number; onComplete?: () => void }) => { triggerAnimation(elementId, {
        type: 'flip',
        duration: config?.duration || 600,
        delay: config?.delay || 0,
        onComplete: config?.onComplete || undefined
      }); },
    
    rotate: (elementId: string, config?: { duration?: number; delay?: number; onComplete?: () => void }) => { triggerAnimation(elementId, {
        type: 'rotate',
        duration: config?.duration || 600,
        delay: config?.delay || 0,
        onComplete: config?.onComplete || undefined
      }); },
    
    morph: (elementId: string, config?: { duration?: number; delay?: number; onComplete?: () => void }) => { triggerAnimation(elementId, {
        type: 'morph',
        duration: config?.duration || 600,
        delay: config?.delay || 0,
        onComplete: config?.onComplete || undefined
      }); },
    
    glow: (elementId: string, config?: { duration?: number; delay?: number; onComplete?: () => void }) => { triggerAnimation(elementId, {
        type: 'glow',
        duration: config?.duration || 600,
        delay: config?.delay || 0,
        onComplete: config?.onComplete || undefined
      }); },
    
    wave: (elementId: string, config?: { duration?: number; delay?: number; onComplete?: () => void }) => { triggerAnimation(elementId, {
        type: 'wave',
        duration: config?.duration || 600,
        delay: config?.delay || 0,
        onComplete: config?.onComplete || undefined
      }); },
    
    confetti: (elementId: string, config?: { duration?: number; delay?: number; onComplete?: () => void }) => { triggerAnimation(elementId, {
        type: 'confetti',
        duration: config?.duration || 600,
        delay: config?.delay || 0,
        onComplete: config?.onComplete || undefined
      }); }
  };
  
  return {
    premiumAnimations,
    isAnimating
  };
}

export default usePremiumAnimations;
