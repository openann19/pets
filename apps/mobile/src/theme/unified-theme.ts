/**
 * PROJECT HYPERION: UNIFIED DESIGN SYSTEM
 * 
 * Single source of truth for all design tokens, animations, and visual effects.
 * This replaces the scattered design systems across multiple files.
 * 
 * Architecture:
 * - Semantic color tokens for consistent theming
 * - Unified spacing and typography scales
 * - Centralized animation configurations
 * - Performance-optimized motion system
 */

import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// === 1. SEMANTIC COLOR SYSTEM ===
export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main primary
    600: '#9333ea',
    700: '#7c3aed', // Dark primary
    800: '#6b21a8',
    900: '#581c87',
  },

  // Secondary Brand Colors
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Main secondary
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // Accent Colors
  accent: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main accent
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Neutral Colors
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Glass Morphism Colors
  glass: {
    light: {
      subtle: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.15)',
      strong: 'rgba(255, 255, 255, 0.25)',
    },
    dark: {
      subtle: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.2)',
      strong: 'rgba(0, 0, 0, 0.3)',
    },
  },
} as const;

// === 2. GRADIENT SYSTEM ===
export const Gradients = {
  primary: {
    colors: [Colors.primary[500], Colors.primary[400], Colors.primary[300]],
    locations: [0, 0.5, 1],
    angle: 135,
  },
  secondary: {
    colors: [Colors.secondary[500], Colors.secondary[400], Colors.secondary[300]],
    locations: [0, 0.5, 1],
    angle: 135,
  },
  accent: {
    colors: [Colors.accent[500], Colors.accent[400], Colors.accent[300]],
    locations: [0, 0.5, 1],
    angle: 135,
  },
  holographic: {
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
    locations: [0, 0.25, 0.5, 0.75, 1],
    angle: 135,
  },
  sunset: {
    colors: ['#f97316', '#ea580c', '#dc2626', '#b91c1c'],
    locations: [0, 0.33, 0.66, 1],
    angle: 135,
  },
  ocean: {
    colors: ['#06b6d4', '#0891b2', '#0e7490', '#164e63'],
    locations: [0, 0.33, 0.66, 1],
    angle: 135,
  },
} as const;

// === 3. TYPOGRAPHY SYSTEM ===
export const Typography = {
  // Font Families (would be configured with custom fonts)
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },

  // Font Sizes (responsive scale)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },

  // Font Weights
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// === 4. SPACING SYSTEM ===
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 56,
  '8xl': 64,
} as const;

// === 5. BORDER RADIUS SYSTEM ===
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

// === 6. SHADOW SYSTEM ===
export const Shadows = {
  // Depth shadows
  depth: {
    sm: {
      shadowColor: Colors.neutral[950],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: Colors.neutral[950],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: Colors.neutral[950],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: Colors.neutral[950],
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
    '2xl': {
      shadowColor: Colors.neutral[950],
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 32,
      elevation: 16,
    },
  },

  // Glow effects
  glow: {
    primary: {
      shadowColor: Colors.primary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    secondary: {
      shadowColor: Colors.secondary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    accent: {
      shadowColor: Colors.accent[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  },
} as const;

// === 7. MOTION SYSTEM ===
export const Motion = {
  // Spring configurations for react-native-reanimated
  springs: {
    gentle: {
      damping: 25,
      stiffness: 300,
      mass: 1,
    },
    standard: {
      damping: 20,
      stiffness: 400,
      mass: 0.8,
    },
    bouncy: {
      damping: 15,
      stiffness: 500,
      mass: 0.6,
    },
    snappy: {
      damping: 18,
      stiffness: 600,
      mass: 0.5,
    },
  },

  // Timing configurations
  timings: {
    instant: 150,
    fast: 250,
    standard: 300,
    slow: 500,
    slower: 700,
  },

  // Easing functions
  easings: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// === 8. DEVICE UTILITIES ===
export const Device = {
  width: screenWidth,
  height: screenHeight,
  isSmall: screenWidth < 375,
  isMedium: screenWidth >= 375 && screenWidth < 414,
  isLarge: screenWidth >= 414,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
} as const;

// === 9. SEMANTIC TOKENS ===
export const SemanticTokens = {
  // Background colors
  background: {
    primary: Colors.neutral[0],
    secondary: Colors.neutral[50],
    tertiary: Colors.neutral[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: Colors.neutral[900],
    secondary: Colors.neutral[600],
    tertiary: Colors.neutral[500],
    inverse: Colors.neutral[0],
    accent: Colors.primary[500],
    error: Colors.status.error,
    success: Colors.status.success,
    warning: Colors.status.warning,
  },

  // Interactive colors
  interactive: {
    primary: Colors.primary[500],
    primaryHover: Colors.primary[600],
    primaryPressed: Colors.primary[700],
    secondary: Colors.secondary[500],
    secondaryHover: Colors.secondary[600],
    secondaryPressed: Colors.secondary[700],
    accent: Colors.accent[500],
    accentHover: Colors.accent[600],
    accentPressed: Colors.accent[700],
  },

  // Border colors
  border: {
    subtle: Colors.neutral[200],
    default: Colors.neutral[300],
    strong: Colors.neutral[400],
    focus: Colors.primary[500],
    error: Colors.status.error,
  },
} as const;

// === 10. THEME EXPORT ===
export const Theme = {
  colors: Colors,
  gradients: Gradients,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  motion: Motion,
  device: Device,
  semantic: SemanticTokens,
} as const;

export type ThemeType = typeof Theme;

export default Theme;
