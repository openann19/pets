/**
 * Premium Animation System for PawfectMatch
 * Smooth, delightful micro-interactions and transitions
 */

export const animations = {
  // === TIMING FUNCTIONS ===
  easing: {
    // Standard easing curves
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Custom bezier curves for premium feel
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    
    // iOS-style easing
    ios: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Material Design easing
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerated: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerated: 'cubic-bezier(0.4, 0, 1, 1)',
  },

  // === DURATIONS ===
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 750,
  },

  // === SPRING PHYSICS (React Native) ===
  spring: {
    gentle: {
      tension: 120,
      friction: 14,
      useNativeDriver: true,
    },
    wobbly: {
      tension: 180,
      friction: 12,
      useNativeDriver: true,
    },
    stiff: {
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    },
    bouncy: {
      tension: 300,
      friction: 8,
      useNativeDriver: true,
    },
  },

  // === COMMON ANIMATIONS ===
  presets: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 250,
      easing: 'ease-out',
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 200,
      easing: 'ease-in',
    },
    
    // Scale animations
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' },
      duration: 250,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    scaleOut: {
      from: { opacity: 1, transform: 'scale(1)' },
      to: { opacity: 0, transform: 'scale(0.9)' },
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    
    // Slide animations
    slideInUp: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    slideInDown: {
      from: { opacity: 0, transform: 'translateY(-20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    slideInLeft: {
      from: { opacity: 0, transform: 'translateX(-20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    slideInRight: {
      from: { opacity: 0, transform: 'translateX(20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Button press
    buttonPress: {
      from: { transform: 'scale(1)' },
      to: { transform: 'scale(0.95)' },
      duration: 100,
      easing: 'ease-out',
    },
    
    // Card hover
    cardHover: {
      from: { transform: 'translateY(0) scale(1)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      to: { transform: 'translateY(-4px) scale(1.02)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Swipe card
    swipeCard: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    
    // Match celebration
    matchCelebration: {
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    // Typing indicator
    typingDot: {
      duration: 600,
      easing: 'ease-in-out',
      iterationCount: 'infinite',
      direction: 'alternate',
    },
  },

  // === STAGGER ANIMATIONS ===
  stagger: {
    children: 50,    // Delay between child animations
    fast: 25,
    normal: 50,
    slow: 100,
  },

  // === GESTURE ANIMATIONS ===
  gestures: {
    swipe: {
      threshold: 50,      // Minimum distance to trigger
      velocity: 0.3,      // Minimum velocity
      directionalOffset: 80, // Maximum perpendicular offset
    },
    panResponder: {
      threshold: 10,
      gestureHandlerRootHOC: true,
    },
  },

  // === LOADING ANIMATIONS ===
  loading: {
    skeleton: {
      duration: 1200,
      easing: 'ease-in-out',
      iterationCount: 'infinite',
    },
    spinner: {
      duration: 1000,
      easing: 'linear',
      iterationCount: 'infinite',
    },
    pulse: {
      duration: 2000,
      easing: 'ease-in-out',
      iterationCount: 'infinite',
      direction: 'alternate',
    },
  },

  // === NOTIFICATION ANIMATIONS ===
  notifications: {
    toast: {
      enter: {
        from: { opacity: 0, transform: 'translateY(-100%) scale(0.9)' },
        to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      exit: {
        from: { opacity: 1, transform: 'translateY(0) scale(1)' },
        to: { opacity: 0, transform: 'translateY(-100%) scale(0.9)' },
        duration: 200,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    badge: {
      bounce: {
        duration: 400,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
};

// === ANIMATION UTILITIES ===
export const createTransition = (
  property: string | string[],
  duration: number = animations.duration.normal,
  easing: string = animations.easing.smooth
) => {
  const properties = Array.isArray(property) ? property : [property];
  return properties.map(prop => `${prop} ${duration}ms ${easing}`).join(', ');
};

// Keyframe value types
type KeyframeValue = string | number;
type KeyframeStyles = Record<string, KeyframeValue>;
type KeyframeFrames = Record<string, KeyframeStyles>;

export const createKeyframes = (name: string, frames: KeyframeFrames): string => {
  const keyframeString = Object.entries(frames)
    .map(([key, value]) => {
      const styles = Object.entries(value)
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ');
      return `${key} { ${styles} }`;
    })
    .join(' ');
  
  return `@keyframes ${name} { ${keyframeString} }`;
};

// Animation configuration types
interface AnimationConfig {
  from?: Record<string, string | number>;
  to?: Record<string, string | number>;
  duration?: number;
  easing?: string;
  delay?: number;
  iterationCount?: string | number;
  direction?: string;
  [key: string]: unknown;
}

export const withDelay = (animation: AnimationConfig, delay: number): AnimationConfig => ({
  ...animation,
  delay,
});

export const withStagger = (
  animation: AnimationConfig, 
  index: number, 
  staggerDelay: number = animations.stagger.normal
): AnimationConfig => ({
  ...animation,
  delay: (animation.delay || 0) + (index * staggerDelay),
});

export default animations;
