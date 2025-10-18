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
  premiumAnimations: Record<
    'flip' | 'rotate' | 'morph' | 'glow' | 'wave' | 'confetti',
    (elementId: string, config?: Partial<AnimationConfig>) => void
  >;
  isAnimating: (elementId: string) => boolean;
} {
  const { triggerAnimation, isAnimating } = usePawfectAnimations();

  // All premium animations are now available to everyone
  const premiumAnimations = {
    flip: (elementId: string, config?: Partial<AnimationConfig>) => {
      triggerAnimation(elementId, {
        type: 'flip',
        duration: config?.duration ?? 600,
        delay: config?.delay ?? 0,
        onComplete: config?.onComplete
      });
    },

    rotate: (elementId: string, config?: Partial<AnimationConfig>) => {
      triggerAnimation(elementId, {
        type: 'rotate',
        duration: config?.duration ?? 600,
        delay: config?.delay ?? 0,
        onComplete: config?.onComplete
      });
    },

    morph: (elementId: string, config?: Partial<AnimationConfig>) => {
      triggerAnimation(elementId, {
        type: 'morph',
        duration: config?.duration ?? 600,
        delay: config?.delay ?? 0,
        onComplete: config?.onComplete
      });
    },

    glow: (elementId: string, config?: Partial<AnimationConfig>) => {
      triggerAnimation(elementId, {
        type: 'glow',
        duration: config?.duration ?? 600,
        delay: config?.delay ?? 0,
        onComplete: config?.onComplete
      });
    },

    wave: (elementId: string, config?: Partial<AnimationConfig>) => {
      triggerAnimation(elementId, {
        type: 'wave',
        duration: config?.duration ?? 600,
        delay: config?.delay ?? 0,
        onComplete: config?.onComplete
      });
    },

    confetti: (elementId: string, config?: Partial<AnimationConfig>) => {
      triggerAnimation(elementId, {
        type: 'confetti',
        duration: config?.duration ?? 600,
        delay: config?.delay ?? 0,
        onComplete: config?.onComplete
      });
    }
  };

  return {
    premiumAnimations,
    isAnimating
  };
}

export default usePremiumAnimations;
