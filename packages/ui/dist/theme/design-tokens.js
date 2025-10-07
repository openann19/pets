/**
 * 🎨 UNIFIED DESIGN TOKENS - Single Source of Truth
 * Comprehensive design system tokens for consistent styling across web and mobile
 * Optimized for performance, accessibility, and premium user experience
 */
// ====== COLOR PALETTE ======
export const COLORS = {
    // Brand Primary (Pink/Rose) - Main brand identity
    primary: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899', // Main brand color
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
        950: '#500724',
    },
    // Brand Secondary (Blue/Cyan) - Supporting brand color
    secondary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Secondary brand color
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49',
    },
    // Brand Tertiary (Purple/Violet) - Accent color
    tertiary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
        950: '#3b0764',
    },
    // Neutral Grays - Text and backgrounds
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
    },
    // Semantic Colors - Status and feedback
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
    },
    info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
    },
};
// ====== GRADIENTS ======
export const GRADIENTS = {
    // Primary brand gradients
    primary: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    secondary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    tertiary: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    // Premium mesh gradients for special effects
    mesh: {
        warm: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #a8385d 75%, #7f2c53 100%)',
        cool: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        royal: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    // Glass morphism backgrounds
    glass: {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.2)',
        dark: 'rgba(0, 0, 0, 0.1)',
        primary: 'rgba(236, 72, 153, 0.1)',
        secondary: 'rgba(14, 165, 233, 0.1)',
    },
    // Special effects
    holographic: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)',
    neon: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    rainbow: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #9370db)',
};
// ====== SHADOWS ======
export const SHADOWS = {
    // Standard shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    // Premium shadows
    premium: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
    'premium-lg': '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
    // Glass morphism shadow
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    // Color glow shadows
    primaryGlow: '0 10px 40px -10px rgba(236, 72, 153, 0.6)',
    secondaryGlow: '0 10px 40px -10px rgba(14, 165, 233, 0.6)',
    tertiaryGlow: '0 10px 40px -10px rgba(168, 85, 247, 0.6)',
    successGlow: '0 10px 40px -10px rgba(34, 197, 94, 0.6)',
    errorGlow: '0 10px 40px -10px rgba(239, 68, 68, 0.6)',
    warningGlow: '0 10px 40px -10px rgba(245, 158, 11, 0.6)',
    // Neon effects
    neon: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
    neonStrong: '0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.5)',
};
// ====== BLUR EFFECTS ======
export const BLUR = {
    none: 'blur(0)',
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(12px)',
    xl: 'blur(16px)',
    '2xl': 'blur(24px)',
    premium: 'blur(16px) saturate(180%)',
};
// ====== BORDER RADIUS ======
export const RADIUS = {
    none: '0',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
};
// ====== SPACING SCALE ======
export const SPACING = {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
};
// ====== TYPOGRAPHY ======
export const TYPOGRAPHY = {
    // Font families
    fonts: {
        primary: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
    },
    // Font sizes with line heights
    sizes: {
        xs: { size: '0.75rem', lineHeight: '1rem' },
        sm: { size: '0.875rem', lineHeight: '1.25rem' },
        base: { size: '1rem', lineHeight: '1.5rem' },
        lg: { size: '1.125rem', lineHeight: '1.75rem' },
        xl: { size: '1.25rem', lineHeight: '1.75rem' },
        '2xl': { size: '1.5rem', lineHeight: '2rem' },
        '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
        '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
        '5xl': { size: '3rem', lineHeight: '1' },
        '6xl': { size: '3.75rem', lineHeight: '1' },
    },
    // Font weights
    weights: {
        thin: 100,
        extralight: 200,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    },
};
// ====== ANIMATION TOKENS ======
export const ANIMATIONS = {
    // Spring configurations for Framer Motion
    spring: {
        gentle: { stiffness: 200, damping: 35 },
        smooth: { stiffness: 300, damping: 30 },
        bouncy: { stiffness: 600, damping: 15 },
        micro: { stiffness: 400, damping: 25 },
    },
    // Duration tokens
    duration: {
        fast: 0.15,
        medium: 0.3,
        slow: 0.5,
        slower: 0.8,
    },
    // Easing functions
    easing: {
        easeOut: 'ease-out',
        easeIn: 'ease-in',
        easeInOut: 'ease-in-out',
        spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    // Keyframe animations
    keyframes: {
        fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
            '0%': { opacity: '0', transform: 'scale(0.9)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
            '0%': { backgroundPosition: '200% 0' },
            '100%': { backgroundPosition: '-200% 0' },
        },
        holographic: {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
    },
};
// ====== Z-INDEX SCALE ======
export const ZINDEX = {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
    toast: 1500,
};
// ====== BREAKPOINTS ======
export const BREAKPOINTS = {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1600px',
    uhd: '1920px',
    '4k': '3840px',
};
// ====== COMPONENT TOKENS ======
export const COMPONENTS = {
    // Button tokens
    button: {
        sizes: {
            sm: { padding: '8px 16px', fontSize: TYPOGRAPHY.sizes.sm.size, minHeight: '36px' },
            md: { padding: '12px 24px', fontSize: TYPOGRAPHY.sizes.base.size, minHeight: '44px' },
            lg: { padding: '16px 32px', fontSize: TYPOGRAPHY.sizes.lg.size, minHeight: '52px' },
            xl: { padding: '20px 40px', fontSize: TYPOGRAPHY.sizes.xl.size, minHeight: '60px' },
        },
        borderRadius: RADIUS.xl,
    },
    // Input tokens
    input: {
        sizes: {
            sm: { padding: '8px 12px', fontSize: TYPOGRAPHY.sizes.sm.size, minHeight: '40px' },
            md: { padding: '12px 16px', fontSize: TYPOGRAPHY.sizes.base.size, minHeight: '48px' },
            lg: { padding: '16px 20px', fontSize: TYPOGRAPHY.sizes.lg.size, minHeight: '56px' },
        },
        borderRadius: RADIUS.lg,
    },
    // Card tokens
    card: {
        borderRadius: RADIUS['2xl'],
        padding: {
            sm: SPACING[3],
            md: SPACING[5],
            lg: SPACING[7],
            xl: SPACING[9],
        },
    },
};
// ====== UTILITY FUNCTIONS ======
export const utils = {
    // Get color with opacity
    colorWithOpacity: (color, opacity) => {
        // Convert hex to rgba if needed
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    },
    // Get responsive value
    responsive: (values) => {
        return Object.entries(values)
            .map(([breakpoint, value]) => {
            if (breakpoint === 'base')
                return value;
            return `@media (min-width: ${BREAKPOINTS[breakpoint]}) { ${value} }`;
        })
            .join(' ');
    },
    // Create CSS custom properties
    createCSSVariables: (tokens, prefix = '') => {
        const variables = {};
        const processTokens = (obj, currentPrefix) => {
            Object.entries(obj).forEach(([key, value]) => {
                const variableName = `--${currentPrefix}${key}`;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    processTokens(value, `${currentPrefix}${key}-`);
                }
                else {
                    variables[variableName] = String(value);
                }
            });
        };
        processTokens(tokens, prefix);
        return variables;
    },
};
//# sourceMappingURL=design-tokens.js.map