/**
 * 🎭 ENHANCED PREMIUM ANIMATION SYSTEM
 * World-class animations with spring physics and advanced interactions
 */

// ====== PREMIUM MOTION CONFIGS ======
export const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export const MICRO_CONFIG = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

export const SMOOTH_CONFIG = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 35,
  mass: 1.2,
};

export const BOUNCY_CONFIG = {
  type: 'spring' as const,
  stiffness: 600,
  damping: 15,
  mass: 0.6,
};

// ====== STAGGER ANIMATIONS ======
export const _STAGGER_CONFIG = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const _FAST_STAGGER_CONFIG = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// ====== PREMIUM ANIMATION VARIANTS ======
export const _PREMIUM_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 24, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 1.02 },
    transition: SPRING_CONFIG,
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: BOUNCY_CONFIG,
  },

  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: SPRING_CONFIG,
  },

  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: SPRING_CONFIG,
  },

  slideInUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
    transition: SPRING_CONFIG,
  },

  slideInDown: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
    transition: SPRING_CONFIG,
  },

  popIn: {
    initial: { opacity: 0, scale: 0.3, y: 40 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 },
    transition: BOUNCY_CONFIG,
  },

  flipInX: {
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
    transition: SPRING_CONFIG,
  },

  flipInY: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
    transition: SPRING_CONFIG,
  },
};

// ====== PREMIUM HOVER EFFECTS ======
export const _HOVER_VARIANTS = {
  lift: {
    scale: 1.02,
    y: -4,
    transition: MICRO_CONFIG,
  },

  gentleLift: {
    scale: 1.01,
    y: -2,
    transition: MICRO_CONFIG,
  },

  strongLift: {
    scale: 1.05,
    y: -8,
    transition: MICRO_CONFIG,
  },

  glow: {
    scale: 1.02,
    y: -2,
    boxShadow: '0 20px 40px -12px rgba(236, 72, 153, 0.5)',
    transition: MICRO_CONFIG,
  },

  tilt: {
    rotateZ: 2,
    scale: 1.02,
    transition: MICRO_CONFIG,
  },
};

// ====== PREMIUM TAP EFFECTS ======
export const _TAP_VARIANTS = {
  press: {
    scale: 0.95,
    transition: MICRO_CONFIG,
  },

  gentlePress: {
    scale: 0.98,
    transition: MICRO_CONFIG,
  },

  strongPress: {
    scale: 0.9,
    transition: MICRO_CONFIG,
  },
};

// ====== ENHANCED ANIMATIONS ======
export const _CARD_HOVER_ANIMATION = {
  scale: 1.02,
  rotateY: 2,
  y: -4,
  transition: MICRO_CONFIG,
};

export const _PAGE_TRANSITION = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 1.02 },
  transition: SMOOTH_CONFIG,
};
