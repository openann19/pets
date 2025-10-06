/**
 * 🎨 UNIFIED DESIGN SYSTEM FOR PAWFECTMATCH
 * Single source of truth for consistent visual design across web and mobile
 * Enforces unified button styles, input fields, and interaction patterns
 */

import { COLORS, GRADIENTS, RADIUS, SHADOWS, TYPOGRAPHY } from './design-system';

// ====== UNIFIED BUTTON SYSTEM ======
export const BUTTON_SYSTEM = {
  // Button Variants - Consistent across web and mobile
  variants: {
    primary: {
      web: {
        background: GRADIENTS.primary,
        color: COLORS.neutral[0],
        shadow: SHADOWS.primaryGlow,
        border: 'none',
        hover: {
          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
          transform: 'translateY(-2px)',
          shadow: SHADOWS.primaryGlow,
        },
        active: {
          transform: 'translateY(0)',
          shadow: SHADOWS.lg,
        },
      },
      mobile: {
        background: [COLORS.primary[500], COLORS.primary[400]],
        color: COLORS.neutral[0],
        shadow: 'primaryShadow',
        border: 'none',
      },
    },
    secondary: {
      web: {
        background: GRADIENTS.secondary,
        color: COLORS.neutral[0],
        shadow: SHADOWS.secondaryGlow,
        border: 'none',
        hover: {
          background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
          transform: 'translateY(-2px)',
          shadow: SHADOWS.secondaryGlow,
        },
      },
      mobile: {
        background: [COLORS.secondary[500], COLORS.secondary[400]],
        color: COLORS.neutral[0],
        shadow: 'secondaryShadow',
        border: 'none',
      },
    },
    glass: {
      web: {
        background: GRADIENTS.glass.light,
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: COLORS.neutral[800],
        shadow: SHADOWS.glass,
        hover: {
          background: GRADIENTS.glass.primary,
          border: '1px solid rgba(255, 255, 255, 0.4)',
          transform: 'translateY(-1px)',
        },
      },
      mobile: {
        background: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
        color: COLORS.neutral[800],
        shadow: 'lg',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      },
    },
    outline: {
      web: {
        background: 'transparent',
        color: COLORS.primary[500],
        border: `2px solid ${COLORS.primary[500]}`,
        shadow: 'none',
        hover: {
          background: COLORS.primary[50],
          transform: 'translateY(-1px)',
        },
      },
      mobile: {
        background: 'transparent',
        color: COLORS.primary,
        border: `2px solid ${COLORS.primary}`,
        shadow: 'none',
      },
    },
  },

  // Button Sizes - Consistent across platforms
  sizes: {
    sm: {
      web: {
        padding: '8px 16px',
        fontSize: TYPOGRAPHY.sizes.sm.size,
        minHeight: '36px',
        borderRadius: RADIUS.lg,
      },
      mobile: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        minHeight: 36,
        borderRadius: 8,
      },
    },
    md: {
      web: {
        padding: '12px 24px',
        fontSize: TYPOGRAPHY.sizes.base.size,
        minHeight: '44px',
        borderRadius: RADIUS.xl,
      },
      mobile: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        fontSize: 16,
        minHeight: 44,
        borderRadius: 12,
      },
    },
    lg: {
      web: {
        padding: '16px 32px',
        fontSize: TYPOGRAPHY.sizes.lg.size,
        minHeight: '52px',
        borderRadius: RADIUS['2xl'],
      },
      mobile: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        fontSize: 18,
        minHeight: 52,
        borderRadius: 16,
      },
    },
    xl: {
      web: {
        padding: '20px 40px',
        fontSize: TYPOGRAPHY.sizes.xl.size,
        minHeight: '60px',
        borderRadius: RADIUS['2xl'],
      },
      mobile: {
        paddingHorizontal: 40,
        paddingVertical: 20,
        fontSize: 20,
        minHeight: 60,
        borderRadius: 16,
      },
    },
  },

  // Button States
  states: {
    disabled: {
      web: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
      },
      mobile: {
        opacity: 0.5,
      },
    },
    loading: {
      web: {
        opacity: 0.8,
        cursor: 'wait',
      },
      mobile: {
        opacity: 0.8,
      },
    },
  },
} as const;

// ====== UNIFIED INPUT SYSTEM ======
export const INPUT_SYSTEM = {
  // Input Variants
  variants: {
    default: {
      web: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: COLORS.neutral[0],
        focus: {
          background: 'rgba(255, 255, 255, 0.15)',
          border: `2px solid ${COLORS.primary[400]}`,
          shadow: `0 0 0 3px ${COLORS.primary[200]}40`,
        },
      },
      mobile: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: COLORS.neutral[0],
        focus: {
          background: 'rgba(255, 255, 255, 0.15)',
          border: `2px solid ${COLORS.primary}`,
        },
      },
    },
    filled: {
      web: {
        background: COLORS.neutral[50],
        border: `1px solid ${COLORS.neutral[200]}`,
        color: COLORS.neutral[800],
        focus: {
          background: COLORS.neutral[0],
          border: `2px solid ${COLORS.primary[500]}`,
          shadow: `0 0 0 3px ${COLORS.primary[100]}`,
        },
      },
      mobile: {
        background: COLORS.neutral[50],
        border: `1px solid ${COLORS.neutral[200]}`,
        color: COLORS.neutral[800],
        focus: {
          background: COLORS.neutral[0],
          border: `2px solid ${COLORS.primary}`,
        },
      },
    },
    outline: {
      web: {
        background: 'transparent',
        border: `2px solid ${COLORS.neutral[300]}`,
        color: COLORS.neutral[800],
        focus: {
          border: `2px solid ${COLORS.primary[500]}`,
          shadow: `0 0 0 3px ${COLORS.primary[100]}`,
        },
      },
      mobile: {
        background: 'transparent',
        border: `2px solid ${COLORS.neutral[300]}`,
        color: COLORS.neutral[800],
        focus: {
          border: `2px solid ${COLORS.primary}`,
        },
      },
    },
  },

  // Input Sizes
  sizes: {
    sm: {
      web: {
        padding: '8px 12px',
        fontSize: TYPOGRAPHY.sizes.sm.size,
        borderRadius: RADIUS.md,
      },
      mobile: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        borderRadius: 8,
      },
    },
    md: {
      web: {
        padding: '12px 16px',
        fontSize: TYPOGRAPHY.sizes.base.size,
        borderRadius: RADIUS.lg,
      },
      mobile: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderRadius: 12,
      },
    },
    lg: {
      web: {
        padding: '16px 20px',
        fontSize: TYPOGRAPHY.sizes.lg.size,
        borderRadius: RADIUS.xl,
      },
      mobile: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 18,
        borderRadius: 16,
      },
    },
  },

  // Input States
  states: {
    error: {
      web: {
        border: `2px solid ${COLORS.error[500]}`,
        background: '#fef2f2',
        shadow: `0 0 0 3px ${COLORS.error[100]}`,
      },
      mobile: {
        border: `2px solid ${COLORS.error}`,
        background: '#fef2f2',
      },
    },
    success: {
      web: {
        border: `2px solid ${COLORS.success[500]}`,
        background: '#f0fdf4',
        shadow: `0 0 0 3px ${COLORS.success[100]}`,
      },
      mobile: {
        border: `2px solid ${COLORS.success}`,
        background: '#f0fdf4',
      },
    },
    disabled: {
      web: {
        opacity: 0.5,
        cursor: 'not-allowed',
        background: COLORS.neutral[100],
      },
      mobile: {
        opacity: 0.5,
        background: COLORS.neutral[100],
      },
    },
  },
} as const;

// ====== UNIFIED CARD SYSTEM ======
export const CARD_SYSTEM = {
  variants: {
    default: {
      web: {
        background: COLORS.neutral[0],
        shadow: SHADOWS.lg,
        border: `1px solid ${COLORS.neutral[200]}`,
        borderRadius: RADIUS['2xl'],
      },
      mobile: {
        background: COLORS.neutral[0],
        shadow: 'lg',
        border: `1px solid ${COLORS.neutral[200]}`,
        borderRadius: 16,
      },
    },
    glass: {
      web: {
        background: GRADIENTS.glass.light,
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        shadow: SHADOWS.glass,
        borderRadius: RADIUS['2xl'],
      },
      mobile: {
        background: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
        border: '1px solid rgba(255, 255, 255, 0.2)',
        shadow: 'lg',
        borderRadius: 16,
      },
    },
    elevated: {
      web: {
        background: COLORS.neutral[0],
        shadow: SHADOWS['2xl'],
        borderRadius: RADIUS['2xl'],
        transform: 'translateY(-4px)',
      },
      mobile: {
        background: COLORS.neutral[0],
        shadow: '2xl',
        borderRadius: 16,
      },
    },
  },
} as const;

// ====== UNIFIED TYPOGRAPHY SYSTEM ======
export const TYPOGRAPHY_SYSTEM = {
  // Font Families
  fonts: {
    primary: {
      web: TYPOGRAPHY.fonts.primary,
      mobile: 'System',
    },
    display: {
      web: TYPOGRAPHY.fonts.display,
      mobile: 'System',
    },
  },

  // Text Styles
  styles: {
    h1: {
      web: {
        fontSize: TYPOGRAPHY.sizes['4xl'].size,
        fontWeight: TYPOGRAPHY.weights.extrabold,
        lineHeight: TYPOGRAPHY.sizes['4xl'].lineHeight,
      },
      mobile: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 40,
      },
    },
    h2: {
      web: {
        fontSize: TYPOGRAPHY.sizes['3xl'].size,
        fontWeight: TYPOGRAPHY.weights.bold,
        lineHeight: TYPOGRAPHY.sizes['3xl'].lineHeight,
      },
      mobile: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
      },
    },
    h3: {
      web: {
        fontSize: TYPOGRAPHY.sizes['2xl'].size,
        fontWeight: TYPOGRAPHY.weights.semibold,
        lineHeight: TYPOGRAPHY.sizes['2xl'].lineHeight,
      },
      mobile: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
      },
    },
    body: {
      web: {
        fontSize: TYPOGRAPHY.sizes.base.size,
        fontWeight: TYPOGRAPHY.weights.regular,
        lineHeight: TYPOGRAPHY.sizes.base.lineHeight,
      },
      mobile: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
      },
    },
    caption: {
      web: {
        fontSize: TYPOGRAPHY.sizes.sm.size,
        fontWeight: TYPOGRAPHY.weights.medium,
        lineHeight: TYPOGRAPHY.sizes.sm.lineHeight,
      },
      mobile: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
      },
    },
  },
} as const;

// ====== UNIFIED ANIMATION SYSTEM ======
export const ANIMATION_SYSTEM = {
  transitions: {
    fast: {
      web: { duration: 0.15, ease: 'easeOut' },
      mobile: { duration: 150 },
    },
    medium: {
      web: { duration: 0.3, ease: 'easeOut' },
      mobile: { duration: 300 },
    },
    slow: {
      web: { duration: 0.5, ease: 'easeOut' },
      mobile: { duration: 500 },
    },
  },

  // Micro-interactions
  microInteractions: {
    buttonPress: {
      web: { scale: 0.95 },
      mobile: { scale: 0.96 },
    },
    cardHover: {
      web: { y: -4, shadow: SHADOWS['2xl'] },
      mobile: { scale: 0.98 },
    },
    fadeIn: {
      web: { opacity: 0, y: 20 },
      mobile: { opacity: 0, translateY: 20 },
    },
  },
} as const;

// ====== UNIFIED COLOR SYSTEM ======
export const COLOR_SYSTEM = {
  primary: {
    web: COLORS.primary[500],
    mobile: COLORS.primary,
  },
  secondary: {
    web: COLORS.secondary[500],
    mobile: COLORS.secondary,
  },
  success: {
    web: COLORS.success[500],
    mobile: COLORS.success,
  },
  warning: {
    web: COLORS.warning[500],
    mobile: COLORS.warning,
  },
  error: {
    web: COLORS.error[500],
    mobile: COLORS.error,
  },
  text: {
    primary: {
      web: COLORS.neutral[800],
      mobile: COLORS.neutral[800],
    },
    secondary: {
      web: COLORS.neutral[600],
      mobile: COLORS.neutral[600],
    },
    muted: {
      web: COLORS.neutral[500],
      mobile: COLORS.neutral[500],
    },
  },
  background: {
    primary: {
      web: COLORS.neutral[0],
      mobile: COLORS.neutral[0],
    },
    secondary: {
      web: COLORS.neutral[50],
      mobile: COLORS.neutral[50],
    },
  },
} as const;

// ====== UTILITY FUNCTIONS ======
export const utils = {
  // Get platform-specific styles
  getPlatformStyles: <T>(styles: { web: T; mobile: T }, platform: 'web' | 'mobile' = 'web'): T => {
    return styles[platform];
  },

  // Create responsive button styles
  createButtonStyles: (variant: keyof typeof BUTTON_SYSTEM.variants, size: keyof typeof BUTTON_SYSTEM.sizes, platform: 'web' | 'mobile' = 'web') => {
    const variantStyles = BUTTON_SYSTEM.variants[variant][platform];
    const sizeStyles = BUTTON_SYSTEM.sizes[size][platform];
    
    return {
      ...variantStyles,
      ...sizeStyles,
    };
  },

  // Create responsive input styles
  createInputStyles: (variant: keyof typeof INPUT_SYSTEM.variants, size: keyof typeof INPUT_SYSTEM.sizes, platform: 'web' | 'mobile' = 'web') => {
    const variantStyles = INPUT_SYSTEM.variants[variant][platform];
    const sizeStyles = INPUT_SYSTEM.sizes[size][platform];
    
    return {
      ...variantStyles,
      ...sizeStyles,
    };
  },

  // Check if form is valid to enable buttons
  shouldEnableButton: (formState: { isValid: boolean; isDirty: boolean; isLoading?: boolean }) =>
    formState.isValid && formState.isDirty && !formState.isLoading,

  // Get theme-aware colors
  getThemeColor: (colorKey: keyof typeof COLOR_SYSTEM, platform: 'web' | 'mobile' = 'web') => {
    const color = COLOR_SYSTEM[colorKey];
    if (typeof color === 'object' && 'web' in color) {
      return color[platform];
    }
    return color;
  },
} as const;
