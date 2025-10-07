/**
 * 🎭 PREMIUM MOTION SYSTEM
 * Advanced animation patterns for jaw-dropping user experiences
 * Consistent across web and mobile platforms
 */
import { MOTION_CONFIG, TIMING } from '../theme/design-system';
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
};
// ====== ENTRANCE ANIMATIONS ======
export const entranceVariants = {
    // Standard fade in up
    fadeInUp: {
        opacity: 0,
        y: 24,
        scale: 0.95,
        transition: transitions.spring,
    },
    // Slide in from different directions
    slideInLeft: {
        opacity: 0,
        x: -100,
        transition: transitions.spring,
    },
    slideInRight: {
        opacity: 0,
        x: 100,
        transition: transitions.spring,
    },
    slideInUp: {
        opacity: 0,
        y: 100,
        transition: transitions.spring,
    },
    slideInDown: {
        opacity: 0,
        y: -100,
        transition: transitions.spring,
    },
    // Scale animations
    scaleIn: {
        opacity: 0,
        scale: 0.8,
        transition: transitions.bouncy,
    },
    // Premium pop-in effect
    popIn: {
        opacity: 0,
        scale: 0.3,
        y: 40,
        transition: transitions.bouncy,
    },
    // Flip animations
    flipInX: {
        opacity: 0,
        rotateX: -90,
        transformPerspective: 1000,
        transition: transitions.spring,
    },
    flipInY: {
        opacity: 0,
        rotateY: -90,
        transformPerspective: 1000,
        transition: transitions.spring,
    },
};
// ====== HOVER ANIMATIONS ======
export const hoverVariants = {
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
export const tapVariants = {
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
export const staggerVariants = {
    // Container for staggered children
    container: {
        transition: {
            staggerChildren: TIMING.stagger.normal,
            delayChildren: 0.1,
        },
    },
    fastContainer: {
        transition: {
            staggerChildren: TIMING.stagger.fast,
            delayChildren: 0.05,
        },
    },
    slowContainer: {
        transition: {
            staggerChildren: TIMING.stagger.slow,
            delayChildren: 0.2,
        },
    },
    // Items for staggered containers
    item: {
        opacity: 0,
        y: 20,
        transition: transitions.spring,
    },
    itemSlide: {
        opacity: 0,
        x: -30,
        transition: transitions.spring,
    },
    itemScale: {
        opacity: 0,
        scale: 0.8,
        transition: transitions.spring,
    },
};
// ====== PAGE TRANSITIONS ======
export const pageVariants = {
    // Standard page transition
    default: {
        opacity: 0,
        y: 20,
        scale: 0.98,
        transition: transitions.smooth,
    },
    // Slide page transitions
    slideLeft: {
        x: "100%",
        transition: transitions.smooth,
    },
    slideRight: {
        x: "-100%",
        transition: transitions.smooth,
    },
    // Scale page transition
    scale: {
        opacity: 0,
        scale: 1.1,
        transition: transitions.smooth,
    },
    // Blur transition
    blur: {
        opacity: 0,
        filter: "blur(10px)",
        transition: transitions.smooth,
    },
};
// ====== MODAL ANIMATIONS ======
export const modalVariants = {
    // Backdrop
    backdrop: {
        opacity: 0,
        transition: { duration: TIMING.duration.fast },
    },
    // Modal content
    modal: {
        opacity: 0,
        scale: 0.75,
        y: 100,
        transition: transitions.spring,
    },
    // Slide up modal
    slideUp: {
        opacity: 0,
        y: "100%",
        transition: transitions.spring,
    },
    // Side sheet
    sideSheet: {
        opacity: 0,
        x: "100%",
        transition: transitions.smooth,
    },
};
// ====== LOADING ANIMATIONS ======
export const loadingVariants = {
    // Spinner
    spinner: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: "linear",
        },
    },
    // Pulse
    pulse: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.7, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
    // Skeleton shimmer
    shimmer: {
        backgroundPosition: ["200% 0", "-200% 0"],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "linear",
        },
    },
    // Bounce dots
    bounceDot: {
        y: [0, -20, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};
// ====== NOTIFICATION ANIMATIONS ======
export const notificationVariants = {
    // Toast from top
    toastTop: {
        opacity: 0,
        y: -100,
        scale: 0.9,
        transition: transitions.bouncy,
    },
    // Toast from bottom
    toastBottom: {
        opacity: 0,
        y: 100,
        scale: 0.9,
        transition: transitions.bouncy,
    },
    // Toast from right
    toastRight: {
        opacity: 0,
        x: 400,
        scale: 0.9,
        transition: transitions.spring,
    },
};
// ====== UTILITY FUNCTIONS ======
export const motionUtils = {
    // Create custom spring transition
    createSpring: (config) => ({
        ...MOTION_CONFIG.spring,
        ...config,
    }),
    // Create stagger container
    createStagger: (staggerDelay = TIMING.stagger.normal, delayChildren = 0.1) => ({
        transition: {
            staggerChildren: staggerDelay,
            delayChildren,
        },
    }),
    // Create entrance variant
    createEntrance: (from, transition = transitions.spring) => ({
        opacity: 0,
        ...from,
        transition,
    }),
    // Create hover variant
    createHover: (to, transition = transitions.micro) => ({
        ...to,
        transition,
    }),
    // Create layout animation
    layoutTransition: transitions.layout,
};
//# sourceMappingURL=premium-motion.js.map