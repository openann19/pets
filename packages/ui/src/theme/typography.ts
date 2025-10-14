/**
 * Premium Typography System for PawfectMatch
 * Responsive, accessible, and beautifully crafted text styles
 */

export const typography = {
  // === FONT FAMILIES ===
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
  },

  // === FONT WEIGHTS ===
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // === FONT SIZES ===
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // === LINE HEIGHTS ===
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // === LETTER SPACING ===
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // === TEXT STYLES ===
  styles: {
    // Headers
    h1: {
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.35,
    },
    h5: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.4,
    },

    // Body text
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },

    // UI text
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.25,
      letterSpacing: '0.025em',
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 1.25,
      letterSpacing: '0.025em',
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.25,
      letterSpacing: '0.05em',
    },
    overline: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 1.25,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },

    // Chat specific
    chatMessage: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    chatTime: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 1.25,
    },
    chatName: {
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 1.25,
    },

    // Card text
    cardTitle: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 1.3,
    },
    cardSubtitle: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.4,
    },
    cardBody: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
  },

  // === RESPONSIVE BREAKPOINTS ===
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};

// === UTILITY FUNCTIONS ===
export const _getResponsiveFontSize = (baseSize: number, scale = 1.2): Record<string, unknown> => ({
  fontSize: baseSize,
  '@media (min-width: 768px)': {
    fontSize: baseSize * scale,
  },
});

export const _truncateText = (lines = 1): Record<string, unknown> => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical' as const,
});

export default typography;
