import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// === PROJECT HYPERION: ENHANCED DESIGN TOKENS ===
// Extends the existing design system with premium, animated, and interactive features

// === 1.1 DYNAMIC COLOR SYSTEM ===
export const DynamicColors = {
  // Multi-Faceted Gradient Palettes
  gradients: {
    primary: {
      name: 'Primary',
      colors: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe'],
      locations: [0, 0.3, 0.7, 1],
      angle: 135,
    },
    secondary: {
      name: 'Secondary',
      colors: ['#ec4899', '#f472b6', '#fb7185', '#fecdd3'],
      locations: [0, 0.3, 0.7, 1],
      angle: 135,
    },
    premium: {
      name: 'Premium',
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'],
      locations: [0, 0.3, 0.7, 1],
      angle: 135,
    },
    sunset: {
      name: 'Sunset',
      colors: ['#f97316', '#ea580c', '#dc2626', '#b91c1c'],
      locations: [0, 0.3, 0.7, 1],
      angle: 135,
    },
    ocean: {
      name: 'Ocean',
      colors: ['#06b6d4', '#0891b2', '#0e7490', '#164e63'],
      locations: [0, 0.3, 0.7, 1],
      angle: 135,
    },
  },

  // Glass Morphism Tiers with Enhanced Transparency
  glass: {
    subtle: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
    },
    medium: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(255,255,255,0.25)',
      borderWidth: 1,
    },
    strong: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      backdropFilter: 'blur(16px)',
      borderColor: 'rgba(255,255,255,0.3)',
      borderWidth: 1,
    },
    dark: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      backdropFilter: 'blur(8px)',
      borderColor: 'rgba(0,0,0,0.2)',
      borderWidth: 1,
    },
    darkMedium: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(0,0,0,0.3)',
      borderWidth: 1,
    },
    darkStrong: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(16px)',
      borderColor: 'rgba(0,0,0,0.4)',
      borderWidth: 1,
    },
  },

  // Animated Holographic & Neon Effects
  holographic: {
    shimmer: {
      colors: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)'],
      locations: [0, 0.5, 1],
      animation: 'shimmer 2s ease-in-out infinite',
    },
    neonGlow: {
      primary: {
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
      },
      secondary: {
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
      },
      accent: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
      },
    },
  },
};

// === 1.2 ENHANCED TYPOGRAPHY SYSTEM ===
export const EnhancedTypography = {
  // Responsive Fluid Type Scale
  fluidSizes: {
    xs: { min: 10, max: 12, viewport: [320, 768] },
    sm: { min: 12, max: 14, viewport: [320, 768] },
    base: { min: 14, max: 16, viewport: [320, 768] },
    lg: { min: 16, max: 18, viewport: [320, 768] },
    xl: { min: 18, max: 20, viewport: [320, 768] },
    '2xl': { min: 20, max: 24, viewport: [320, 768] },
    '3xl': { min: 24, max: 28, viewport: [320, 768] },
    '4xl': { min: 28, max: 32, viewport: [320, 768] },
    '5xl': { min: 32, max: 36, viewport: [320, 768] },
    '6xl': { min: 36, max: 48, viewport: [320, 768] },
  },

  // Premium Font Effects
  effects: {
    gradient: {
      primary: {
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
      secondary: {
        background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fb7185 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
    },
    shadow: {
      subtle: {
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      glow: {
        textShadowColor: '#7c3aed',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
      },
    },
  },

  // Animated Text Styles
  animations: {
    fadeInUp: {
      opacity: 0,
      transform: [{ translateY: 20 }],
      animation: 'fadeInUp 0.6s ease-out forwards',
    },
    slideInLeft: {
      opacity: 0,
      transform: [{ translateX: -20 }],
      animation: 'slideInLeft 0.6s ease-out forwards',
    },
    scaleIn: {
      opacity: 0,
      transform: [{ scale: 0.8 }],
      animation: 'scaleIn 0.5s ease-out forwards',
    },
  },
};

// === 1.3 SEMANTIC COLOR TOKENS ===
export const SemanticColors = {
  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    overlay: 'rgba(0,0,0,0.5)',
    glass: 'rgba(255,255,255,0.1)',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    accent: '#7c3aed',
    inverse: '#ffffff',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },

  // Interactive Colors
  interactive: {
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryPressed: '#5b21b6',
    secondary: '#ec4899',
    secondaryHover: '#db2777',
    secondaryPressed: '#be185d',
    accent: '#0ea5e9',
    accentHover: '#0284c7',
    accentPressed: '#0369a1',
  },

  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Border Colors
  border: {
    subtle: '#f3f4f6',
    default: '#e5e7eb',
    strong: '#d1d5db',
    focus: '#7c3aed',
    error: '#ef4444',
  },
};

// === 3.1 ENHANCED SHADOW & GLOW SYSTEM ===
export const EnhancedShadows = {
  // Depth System Tokens
  depth: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 32,
      elevation: 16,
    },
  },

  // Glow Effects
  glow: {
    primary: {
      shadowColor: '#7c3aed',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    secondary: {
      shadowColor: '#ec4899',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    accent: {
      shadowColor: '#0ea5e9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    success: {
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    warning: {
      shadowColor: '#f59e0b',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    error: {
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // Colored Shadows
  colored: {
    primary: {
      shadowColor: '#7c3aed',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    secondary: {
      shadowColor: '#ec4899',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    accent: {
      shadowColor: '#0ea5e9',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

// === 5.1 ANIMATION SYSTEM ===
export const MotionSystem = {
  // Spring Physics Configurations
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

  // Timing Configurations
  timings: {
    instant: 150,
    fast: 250,
    standard: 300,
    slow: 500,
    slower: 700,
  },

  // Easing Functions
  easings: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Animation Hooks Configuration
  hooks: {
    useSpring: {
      defaultConfig: 'standard',
      immediate: false,
    },
    useTransition: {
      defaultConfig: 'standard',
      trail: 50,
    },
    useTrail: {
      defaultConfig: 'gentle',
      reverse: false,
    },
  },
};

// === ACCESSIBILITY ENHANCEMENTS ===
export const Accessibility = {
  // Reduced Motion Support
  motion: {
    prefersReducedMotion: Platform.OS === 'ios' ? true : false, // Will be dynamic
    reducedMotionConfigs: {
      springs: {
        damping: 30,
        stiffness: 200,
        mass: 1,
      },
      timings: {
        instant: 0,
        fast: 100,
        standard: 200,
        slow: 300,
        slower: 400,
      },
    },
  },

  // High Contrast Mode
  contrast: {
    high: {
      colors: {
        background: '#ffffff',
        surface: '#ffffff',
        text: '#000000',
        border: '#000000',
      },
    },
  },
};

// === UTILITY FUNCTIONS ===
export const DesignUtils = {
  // Calculate fluid typography size
  getFluidSize: (config: { min: number; max: number; viewport: [number, number] }) => {
    const { min, max, viewport } = config;
    const [minViewport, maxViewport] = viewport;
    const slope = (max - min) / (maxViewport - minViewport);
    const intercept = min - slope * minViewport;
    return Math.max(min, Math.min(max, slope * screenWidth + intercept));
  },

  // Get appropriate spring config based on motion preferences
  getSpringConfig: (type: keyof typeof MotionSystem.springs = 'standard') => {
    // This will be enhanced with actual motion preference detection
    return MotionSystem.springs[type];
  },

  // Generate gradient style object
  createGradient: (gradientName: keyof typeof DynamicColors.gradients) => {
    const gradient = DynamicColors.gradients[gradientName];
    return {
      background: `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})`,
    };
  },
};

export default {
  DynamicColors,
  EnhancedTypography,
  SemanticColors,
  EnhancedShadows,
  MotionSystem,
  Accessibility,
  DesignUtils,
};
