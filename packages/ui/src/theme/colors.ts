/**
 * Ultra-Premium Color System for PawfectMatch
 * Supports both light and dark modes with sophisticated gradients and shadows
 */

export const colors = {
  // === PRIMARY BRAND COLORS ===
  primary: '#FF6B6B',           // Vibrant coral - main brand
  primaryLight: '#FF8E8E',      // Soft gradient companion
  primaryDark: '#E55555',       // Deeper coral for contrast
  
  // === SECONDARY & ACCENT ===
  secondary: '#4ECDC4',         // Teal accent
  secondaryLight: '#7ED8D1',    // Light teal
  accent: '#FFD700',            // Luxury gold
  accentLight: '#FFE55C',       // Light gold
  
  // === SUCCESS, WARNING, ERROR ===
  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  error: '#F44336',
  errorLight: '#EF5350',
  
  // === LIGHT MODE COLORS ===
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F1F3F4',
    
    // Surfaces
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceOverlay: 'rgba(255, 255, 255, 0.95)',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',
    
    // Borders & Dividers
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    divider: '#EEEEEE',
    
    // Glass morphism
    glassWhite: 'rgba(255, 255, 255, 0.8)',
    glassWhiteLight: 'rgba(255, 255, 255, 0.6)',
    glassDark: 'rgba(0, 0, 0, 0.1)',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.15)',
  },
  
  // === DARK MODE COLORS ===
  dark: {
    // Backgrounds
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2A2A2A',
    
    // Surfaces
    surface: '#1E1E1E',
    surfaceElevated: '#2A2A2A',
    surfaceOverlay: 'rgba(30, 30, 30, 0.95)',
    
    // Text
    text: '#E0E0E0',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textInverse: '#1A1A1A',
    
    // Borders & Dividers
    border: '#333333',
    borderLight: '#2A2A2A',
    divider: '#2A2A2A',
    
    // Glass morphism
    glassWhite: 'rgba(255, 255, 255, 0.1)',
    glassWhiteLight: 'rgba(255, 255, 255, 0.05)',
    glassDark: 'rgba(0, 0, 0, 0.3)',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowDark: 'rgba(0, 0, 0, 0.4)',
  },
  
  // === GRADIENTS ===
  gradients: {
    primary: ['#FF6B6B', '#FF8E8E'],
    secondary: ['#4ECDC4', '#7ED8D1'],
    sunset: ['#FF6B6B', '#FFD700'],
    ocean: ['#4ECDC4', '#45B7B8'],
    success: ['#4CAF50', '#81C784'],
    warning: ['#FF9800', '#FFB74D'],
    error: ['#F44336', '#EF5350'],
    
    // Premium gradients
    luxury: ['#FFD700', '#FFA000'],
    royal: ['#9C27B0', '#E1BEE7'],
    cosmic: ['#3F51B5', '#9FA8DA'],
    
    // Dark mode gradients
    darkPrimary: ['#FF6B6B', '#E55555'],
    darkSecondary: ['#4ECDC4', '#45B7B8'],
  },
  
  // === SEMANTIC COLORS ===
  semantic: {
    online: '#4CAF50',
    offline: '#999999',
    typing: '#4CAF50',
    unread: '#FF6B6B',
    premium: '#FFD700',
    verified: '#2196F3',
  },
};

// === COLOR UTILITIES ===
export const getThemeColors = (isDark: boolean) => {
  return {
    ...colors,
    ...(isDark ? colors.dark : colors.light),
    mode: isDark ? 'dark' : 'light',
  };
};

export const withOpacity = (color: string, opacity: number) => {
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default colors;
