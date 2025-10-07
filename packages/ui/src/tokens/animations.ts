/**
 * Design Tokens - Animations
 * Unified animation system for PawfectMatch
 */

export const ANIMATIONS = {
  // Timing configurations
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  
  // Spring configurations
  spring: {
    gentle: {
      tension: 100,
      friction: 8,
    },
    wobbly: {
      tension: 180,
      friction: 12,
    },
    stiff: {
      tension: 210,
      friction: 20,
    },
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  
  // Animation presets
  presets: {
    fadeIn: {
      opacity: 1,
      duration: 300,
    },
    fadeOut: {
      opacity: 0,
      duration: 300,
    },
    slideInUp: {
      translateY: 0,
      duration: 300,
    },
    slideOutDown: {
      translateY: 100,
      duration: 300,
    },
    scaleIn: {
      scale: 1,
      duration: 300,
    },
    scaleOut: {
      scale: 0,
      duration: 300,
    },
  },
} as const;
