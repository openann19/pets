/**
 * Type definitions for animation system
 */

export interface AnimationConfig {
  from?: Record<string, string | number>;
  to?: Record<string, string | number>;
  duration: number;
  easing: string;
  delay?: number;
  iterationCount?: string | number;
  direction?: string;
}

export interface GestureAnimationConfig extends AnimationConfig {
  threshold?: number;
}

export interface PremiumAnimations {
  worldClass: {
    micro: {
      button: AnimationConfig;
      card: AnimationConfig;
      input: AnimationConfig;
    };
    transitions: {
      fade: AnimationConfig;
      slide: AnimationConfig;
      scale: AnimationConfig;
    };
    celebrations: {
      success: AnimationConfig;
      match: AnimationConfig;
      achievement: AnimationConfig;
    };
  };
  gestures: {
    swipe: {
      left: AnimationConfig;
      right: AnimationConfig;
      up: AnimationConfig;
      down: AnimationConfig;
    };
    magnetic: GestureAnimationConfig;
    haptic: {
      light: number[];
      medium: number[];
      heavy: number[];
    };
  };
}

export interface GestureAnimations {
  swipe: {
    left: AnimationConfig;
    right: AnimationConfig;
    up: AnimationConfig;
    down: AnimationConfig;
  };
  premium: {
    magnetic: GestureAnimationConfig;
    haptic: {
      intensity: string;
      pattern: string;
    };
    particle: {
      count: number;
      colors: string[];
      duration: number;
    };
  };
}

export interface AIAnimations {
  matching: {
    analysis: AnimationConfig;
    result: {
      high: AnimationConfig;
      medium: AnimationConfig;
      low: AnimationConfig;
    };
  };
  vision: {
    scanning: AnimationConfig;
    detected: AnimationConfig;
  };
}
