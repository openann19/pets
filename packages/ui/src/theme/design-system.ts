/**
 * 🎨 PAWFECTMATCH UNIFIED PREMIUM DESIGN SYSTEM
 * The single source of truth for all design tokens across web and mobile
 * Jaw-dropping, production-ready, and fully consistent
 */

// ====== PREMIUM ANIMATION SYSTEM ======
export const MOTION_CONFIG = {
  // Standard spring physics - consistent across all components
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },

  // Micro-interactions
  micro: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },

  // Smooth transitions
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 35,
    mass: 1.2,
  },

  // Bouncy effects
  bouncy: {
    type: "spring" as const,
    stiffness: 600,
    damping: 15,
    mass: 0.6,
  },

  // Layout animations
  layout: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
} as const;

// ====== STAGGER & TIMING ======
export const TIMING = {
  // Stagger delays
  stagger: {
    slow: 0.15,
    normal: 0.1,
    fast: 0.05,
    instant: 0.02,
  },

  // Duration fallbacks (when spring not suitable)
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
} as const;

// ====== PREMIUM COLOR SYSTEM ======
export const COLORS = {
  // === PRIMARY BRAND ===
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3', 
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',  // Main brand
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },

  // === SECONDARY ACCENT ===
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main secondary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // === PREMIUM PURPLE ===
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff', 
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Premium purple
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21b6',
    900: '#581c87',
    950: '#3b0764',
  },

  // === SUCCESS STATES ===
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // === WARNING STATES ===
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // === ERROR STATES ===
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // === NEUTRAL GRAYS ===
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
    1000: '#000000',
  },

  // === SEMANTIC COLORS ===
  semantic: {
    online: '#22c55e',
    offline: '#6b7280', 
    typing: '#3b82f6',
    unread: '#ef4444',
    premium: '#f59e0b',
    verified: '#3b82f6',
    new: '#10b981',
    popular: '#f97316',
  },
} as const;

// ====== PREMIUM GRADIENTS ======
export const GRADIENTS = {
  // Brand gradients
  primary: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  primaryLight: 'linear-gradient(135deg, #f9a8d4 0%, #fbcfe8 100%)',
  primaryDark: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',

  // Secondary gradients  
  secondary: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  secondaryLight: 'linear-gradient(135deg, #7dd3fc 0%, #bae6fd 100%)',

  // Premium gradients
  purple: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
  sunset: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  ocean: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  forest: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  
  // Glass morphism backgrounds
  glass: {
    light: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    dark: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    primary: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)',
    secondary: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)',
  },

  // Mesh gradients (ultra premium)
  mesh: {
    warm: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 25%, #6bcf7f 50%, #4d96ff 75%, #9b59b6 100%)',
    cool: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    sunset: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #f093fb 75%, #a8edea 100%)',
  },
} as const;

// ====== PREMIUM TYPOGRAPHY ======
export const TYPOGRAPHY = {
  fonts: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", monospace',
  },

  weights: {
    thin: 100,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  sizes: {
    xs: { size: 12, lineHeight: 16 },
    sm: { size: 14, lineHeight: 20 },
    base: { size: 16, lineHeight: 24 },
    lg: { size: 18, lineHeight: 28 },
    xl: { size: 20, lineHeight: 28 },
    '2xl': { size: 24, lineHeight: 32 },
    '3xl': { size: 30, lineHeight: 36 },
    '4xl': { size: 36, lineHeight: 40 },
    '5xl': { size: 48, lineHeight: 56 },
    '6xl': { size: 60, lineHeight: 72 },
    '7xl': { size: 72, lineHeight: 80 },
    '8xl': { size: 96, lineHeight: 104 },
    '9xl': { size: 128, lineHeight: 136 },
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em', 
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ====== SPACING SYSTEM ======
export const SPACING = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6, 
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

// ====== BORDER RADIUS ======
export const RADIUS = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// ====== SHADOWS (PREMIUM) ======
export const SHADOWS = {
  // Standard shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Premium colored shadows
  primaryGlow: '0 20px 40px -12px rgba(236, 72, 153, 0.4)',
  secondaryGlow: '0 20px 40px -12px rgba(14, 165, 233, 0.4)', 
  purpleGlow: '0 20px 40px -12px rgba(168, 85, 247, 0.4)',
  successGlow: '0 20px 40px -12px rgba(34, 197, 94, 0.4)',
  warningGlow: '0 20px 40px -12px rgba(245, 158, 11, 0.4)',
  errorGlow: '0 20px 40px -12px rgba(239, 68, 68, 0.4)',

  // Glass morphism shadows
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  glassDark: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
} as const;

// ====== BACKDROP EFFECTS ======
export const BACKDROP = {
  blur: {
    none: 'none',
    sm: 'blur(4px)',
    base: 'blur(8px)', 
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
    '3xl': 'blur(64px)',
  },

  brightness: {
    darkest: 'brightness(0.5)',
    darker: 'brightness(0.75)',
    normal: 'brightness(1)',
    brighter: 'brightness(1.25)',
    brightest: 'brightness(1.5)',
  },

  contrast: {
    low: 'contrast(0.8)',
    normal: 'contrast(1)',
    high: 'contrast(1.2)',
    highest: 'contrast(1.5)',
  },
} as const;

// ====== BREAKPOINTS ======
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ====== Z-INDEX LAYERS ======
export const _Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200, 
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ====== COMPONENT VARIANTS ======
export const VARIANTS = {
  // Button variants
  button: {
    primary: {
      background: GRADIENTS.primary,
      color: COLORS.neutral[0],
      shadow: SHADOWS.primaryGlow,
      hover: {
        transform: 'translateY(-2px)',
        shadow: SHADOWS.primaryGlow,
      },
    },
    secondary: {
      background: GRADIENTS.secondary,
      color: COLORS.neutral[0], 
      shadow: SHADOWS.secondaryGlow,
      hover: {
        transform: 'translateY(-2px)',
        shadow: SHADOWS.secondaryGlow,
      },
    },
    ghost: {
      background: 'transparent',
      color: COLORS.neutral[700],
      border: `1px solid ${COLORS.neutral[300]}`,
      hover: {
        background: COLORS.neutral[50],
        transform: 'translateY(-1px)',
      },
    },
    glass: {
      background: GRADIENTS.glass.light,
      backdropFilter: BACKDROP.blur.md,
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      color: COLORS.neutral[800],
      shadow: SHADOWS.glass,
    },
  },

  // Card variants
  card: {
    default: {
      background: COLORS.neutral[0],
      shadow: SHADOWS.lg,
      border: `1px solid ${COLORS.neutral[200]}`,
      borderRadius: RADIUS['2xl'],
    },
    glass: {
      background: GRADIENTS.glass.light,
      backdropFilter: BACKDROP.blur.lg,
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      shadow: SHADOWS.glass,
      borderRadius: RADIUS['2xl'],
    },
    elevated: {
      background: COLORS.neutral[0],
      shadow: SHADOWS['2xl'],
      borderRadius: RADIUS['2xl'],
      transform: 'translateY(-4px)',
    },
  },
} as const;

// ====== UTILITY FUNCTIONS ======
export const _utils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,

  // Create responsive values
  responsive: <T>(values: Partial<Record<keyof typeof BREAKPOINTS, T>>) => values,

  // Dark mode color
  darkMode: (lightColor: string, darkColor: string) => ({ light: lightColor, dark: darkColor }),

  // Animation variants for Framer Motion
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: MOTION_CONFIG.spring,
  },

  slideIn: (direction: 'left' | 'right' | 'up' | 'down' = 'left') => {
    const directions = {
      left: { x: -100 },
      right: { x: 100 },  
      up: { y: -100 },
      down: { y: 100 },
    };
    
    return {
      initial: { opacity: 0, ...directions[direction] },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, ...directions[direction] },
      transition: MOTION_CONFIG.spring,
    };
  },

  staggerChildren: (delay: keyof typeof TIMING.stagger = 'normal') => ({
    animate: {
      transition: { staggerChildren: TIMING.stagger[delay] }
    }
  }),
} as const;

// ====== TYPE EXPORTS ======
export type ColorScale = typeof COLORS.primary;
export type SpacingValue = keyof typeof SPACING;
export type RadiusValue = keyof typeof RADIUS;
export type ShadowValue = keyof typeof SHADOWS;
export type TypographySize = keyof typeof TYPOGRAPHY.sizes;
export type FontWeight = keyof typeof TYPOGRAPHY.weights;
export type BreakpointKey = keyof typeof BREAKPOINTS;
