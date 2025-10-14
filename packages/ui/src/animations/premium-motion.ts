/**
 * 🎭 PREMIUM MOTION SYSTEM
 * Advanced animation patterns for jaw-dropping user experiences
 * Consistent across web and mobile platforms
 */

import type { Variants, Transition } from 'framer-motion';

// Motion configuration constants
const MOTION_CONFIG = {
  spring: { type: 'spring' as const, stiffness: 300, damping: 25, mass: 1 },
  micro: { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.8 },
  smooth: { type: 'tween' as const, duration: 0.4, ease: 'easeInOut' as const },
  bouncy: { type: 'spring' as const, stiffness: 200, damping: 15, mass: 1.2 },
  layout: { type: 'spring' as const, stiffness: 350, damping: 28, mass: 1 },
};

// Timing constants
const TIMING = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
  stagger: {
    fast: 0.1,
    normal: 0.15,
    slow: 0.2,
  },
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
};

// ====== CORE TRANSITIONS ======
export const transitions = {
  // Standard spring (most common)
  spring: MOTION_CONFIG.spring,
  
  // Micro-interactions (buttons, hovers)
  micro: MOTION_CONFIG.micro,
  
  // Smooth (large movements)
  smooth: MOTION_CONFIG.smooth,
  
  // Bouncy (playful interactions)
  bouncy: MOTION_CONFIG.bouncy,
  
  // Layout animations
  layout: MOTION_CONFIG.layout,
} as const;

// ====== ENTRANCE ANIMATIONS ======
export const entranceVariants: Record<string, Variants> = {
  // Standard fade in up
  fadeInUp: {
    initial: { 
      opacity: 0, 
      y: 24,
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      y: -12,
      scale: 1.02,
      transition: transitions.smooth,
    },
  },

  // Slide in from different directions
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      x: 100,
      transition: transitions.smooth,
    },
  },

  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: transitions.smooth,
    },
  },

  slideInUp: {
    initial: { opacity: 0, y: 100 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      y: -100,
      transition: transitions.smooth,
    },
  },

  slideInDown: {
    initial: { opacity: 0, y: -100 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      y: 100,
      transition: transitions.smooth,
    },
  },

  // Scale animations
  scaleIn: {
    initial: { 
      opacity: 0, 
      scale: 0.8 
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: transitions.bouncy,
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: transitions.smooth,
    },
  },

  // Premium pop-in effect
  popIn: {
    initial: { 
      opacity: 0, 
      scale: 0.3,
      y: 40,
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: transitions.bouncy,
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -20,
      transition: transitions.smooth,
    },
  },

  // Flip animations
  flipInX: {
    initial: { 
      opacity: 0, 
      rotateX: -90,
      transformPerspective: 1000,
    },
    animate: { 
      opacity: 1, 
      rotateX: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      rotateX: 90,
      transition: transitions.smooth,
    },
  },

  flipInY: {
    initial: { 
      opacity: 0, 
      rotateY: -90,
      transformPerspective: 1000,
    },
    animate: { 
      opacity: 1, 
      rotateY: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      rotateY: 90,
      transition: transitions.smooth,
    },
  },
};

// ====== HOVER ANIMATIONS ======
export const hoverVariants: Record<string, unknown> = {
  // Standard lift
  lift: {
    scale: 1.02,
    y: -4,
    transition: transitions.micro,
  },

  // Gentle lift
  gentleLift: {
    scale: 1.01,
    y: -2,
    transition: transitions.micro,
  },

  // Strong lift
  strongLift: {
    scale: 1.05,
    y: -8,
    transition: transitions.micro,
  },

  // 3D perspective
  perspective: {
    scale: 1.02,
    rotateY: 5,
    rotateX: 5,
    transition: transitions.micro,
  },

  // Glow effect (for buttons)
  glow: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 20px 40px -12px rgba(236, 72, 153, 0.5)",
    transition: transitions.micro,
  },

  // Bounce
  bounce: {
    scale: 1.1,
    transition: transitions.bouncy,
  },

  // Rotate
  rotate: {
    rotate: 5,
    transition: transitions.micro,
  },

  // Tilt
  tilt: {
    rotateZ: 2,
    scale: 1.02,
    transition: transitions.micro,
  },
};

// ====== TAP ANIMATIONS ======
export const tapVariants: Record<string, unknown> = {
  // Standard press
  press: {
    scale: 0.95,
    transition: transitions.micro,
  },

  // Gentle press
  gentlePress: {
    scale: 0.98,
    transition: transitions.micro,
  },

  // Strong press
  strongPress: {
    scale: 0.9,
    transition: transitions.micro,
  },

  // Rotate press
  rotatePress: {
    scale: 0.95,
    rotate: -2,
    transition: transitions.micro,
  },

  // Bounce press
  bouncePress: {
    scale: 0.9,
    transition: transitions.bouncy,
  },
};

// ====== STAGGER ANIMATIONS ======
export const staggerVariants: Record<string, Variants> = {
  // Container for staggered children
  container: {
    animate: {
      transition: {
        staggerChildren: TIMING.stagger.normal,
        delayChildren: 0.1,
      },
    },
  },

  fastContainer: {
    animate: {
      transition: {
        staggerChildren: TIMING.stagger.fast,
        delayChildren: 0.05,
      },
    },
  },

  slowContainer: {
    animate: {
      transition: {
        staggerChildren: TIMING.stagger.slow,
        delayChildren: 0.2,
      },
    },
  },

  // Items for staggered containers
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: transitions.spring,
    },
  },

  itemSlide: {
    initial: { opacity: 0, x: -30 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: transitions.spring,
    },
  },

  itemScale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: transitions.spring,
    },
  },
};

// ====== PAGE TRANSITIONS ======
export const pageVariants: Record<string, Variants> = {
  // Standard page transition
  default: {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.98,
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: transitions.smooth,
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 1.02,
      transition: transitions.smooth,
    },
  },

  // Slide page transitions
  slideLeft: {
    initial: { x: "100%" },
    animate: { 
      x: 0,
      transition: transitions.smooth,
    },
    exit: { 
      x: "-100%",
      transition: transitions.smooth,
    },
  },

  slideRight: {
    initial: { x: "-100%" },
    animate: { 
      x: 0,
      transition: transitions.smooth,
    },
    exit: { 
      x: "100%",
      transition: transitions.smooth,
    },
  },

  // Scale page transition
  scale: {
    initial: { 
      opacity: 0, 
      scale: 1.1 
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: transitions.smooth,
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: transitions.smooth,
    },
  },

  // Blur transition
  blur: {
    initial: { 
      opacity: 0, 
      filter: "blur(10px)" 
    },
    animate: { 
      opacity: 1, 
      filter: "blur(0px)",
      transition: transitions.smooth,
    },
    exit: { 
      opacity: 0, 
      filter: "blur(10px)",
      transition: transitions.smooth,
    },
  },
};

// ====== MODAL ANIMATIONS ======
export const modalVariants: Record<string, Variants> = {
  // Backdrop
  backdrop: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: TIMING.duration.fast },
    },
    exit: { 
      opacity: 0,
      transition: { duration: TIMING.duration.fast },
    },
  },

  // Modal content
  modal: {
    initial: { 
      opacity: 0, 
      scale: 0.75,
      y: 100,
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: transitions.smooth,
    },
  },

  // Slide up modal
  slideUp: {
    initial: { 
      opacity: 0, 
      y: "100%",
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      y: "100%",
      transition: transitions.smooth,
    },
  },

  // Side sheet
  sideSheet: {
    initial: { 
      opacity: 0, 
      x: "100%",
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: transitions.smooth,
    },
    exit: { 
      opacity: 0, 
      x: "100%",
      transition: transitions.smooth,
    },
  },
};

// ====== LOADING ANIMATIONS ======
export const loadingVariants: Record<string, Variants> = {
  // Spinner
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  // Pulse
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Skeleton shimmer
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  // Bounce dots
  bounceDot: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

// ====== NOTIFICATION ANIMATIONS ======
export const notificationVariants: Record<string, Variants> = {
  // Toast from top
  toastTop: {
    initial: { 
      opacity: 0, 
      y: -100,
      scale: 0.9,
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: transitions.bouncy,
    },
    exit: { 
      opacity: 0, 
      y: -50,
      scale: 0.95,
      transition: transitions.smooth,
    },
  },

  // Toast from bottom
  toastBottom: {
    initial: { 
      opacity: 0, 
      y: 100,
      scale: 0.9,
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: transitions.bouncy,
    },
    exit: { 
      opacity: 0, 
      y: 50,
      scale: 0.95,
      transition: transitions.smooth,
    },
  },

  // Toast from right
  toastRight: {
    initial: { 
      opacity: 0, 
      x: 400,
      scale: 0.9,
    },
    animate: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      x: 400,
      scale: 0.95,
      transition: transitions.smooth,
    },
  },
};

// ====== UTILITY FUNCTIONS ======
export const _motionUtils = {
  // Create custom spring transition
  createSpring: (config: Partial<typeof MOTION_CONFIG.spring>): Transition => ({
    ...MOTION_CONFIG.spring,
    ...config,
  }),

  // Create stagger container
  createStagger: (
    staggerDelay: number = TIMING.stagger.normal,
    delayChildren = 0.1
  ): Variants => ({
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  }),

  // Create entrance variant
  createEntrance: (
    from: { x?: number; y?: number; scale?: number; rotate?: number },
    transition: Transition = transitions.spring
  ): Variants => ({
    initial: { 
      opacity: 0, 
      ...from 
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      scale: 1, 
      rotate: 0,
      transition,
    },
    exit: { 
      opacity: 0, 
      ...from,
      transition: transitions.smooth,
    },
  }),

  // Create hover variant
  createHover: (
    to: { x?: number; y?: number; scale?: number; rotate?: number },
    transition: Transition = transitions.micro
  ) => ({
    ...to,
    transition,
  }),

  // Create layout animation
  layoutTransition: transitions.layout,
} as const;

// ====== EXPORTS ======
export type EntranceVariant = keyof typeof entranceVariants;
export type HoverVariant = keyof typeof hoverVariants;
export type TapVariant = keyof typeof tapVariants;
export type PageVariant = keyof typeof pageVariants;
export type ModalVariant = keyof typeof modalVariants;
