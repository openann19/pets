'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { _COLORS, BLUR, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../constants/design-tokens';

export type ColorScheme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  // Theme state
  isDark: boolean;
  theme: 'default' | 'premium' | 'minimal';
  reducedMotion: boolean;
  colorScheme: ColorScheme; // NEW: light/dark/system

  // Theme actions
  toggleTheme: () => void;
  setTheme: (theme: 'default' | 'premium' | 'minimal') => void;
  setColorScheme: (scheme: ColorScheme) => void; // NEW: Set color scheme

  // Design tokens
  colors: typeof _COLORS;
  gradients: typeof GRADIENTS;
  shadows: typeof SHADOWS;
  blur: typeof BLUR;
  radius: typeof RADIUS;
  spacing: typeof SPACING;

  // Utility functions
  getColor: (path: string, fallback?: string) => string;
  getGradient: (path: string, fallback?: string) => string;
  getShadow: (path: string, fallback?: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const [isDark, setIsDark] = useState(false);
  const [theme, setThemeState] = useState<'default' | 'premium' | 'minimal'>('default');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('system'); // NEW

  // Initialize theme preferences
  useEffect(() => {
    // Dark mode detection
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedColorScheme = localStorage.getItem('color-scheme') as ColorScheme | null;
    const savedDarkMode = localStorage.getItem('theme-dark');

    // NEW: Initialize color scheme
    const initialColorScheme = savedColorScheme || 'system';
    setColorSchemeState(initialColorScheme);

    // Calculate isDark based on color scheme
    const calculateIsDark = (scheme: ColorScheme): boolean => {
      if (scheme === 'system') {
        return darkModeQuery.matches;
      }
      return scheme === 'dark';
    };

    const initialDark = savedDarkMode !== null ? savedDarkMode === 'true' : calculateIsDark(initialColorScheme);
    setIsDark(initialDark);

    // Theme preference
    const savedTheme = localStorage.getItem('theme-name') as 'default' | 'premium' | 'minimal' | null;
    if (savedTheme && ['default', 'premium', 'minimal'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }

    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const savedReducedMotion = localStorage.getItem('reduced-motion');
    const initialReducedMotion = savedReducedMotion !== null ? savedReducedMotion === 'true' : motionQuery.matches;
    setReducedMotion(initialReducedMotion);

    // Listen for changes
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      // NEW: Only respond to system changes if color scheme is 'system'
      const currentScheme = localStorage.getItem('color-scheme') as ColorScheme | null;
      if (currentScheme === 'system' || currentScheme === null) {
        setIsDark(e.matches);
      }
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('reduced-motion') === null) {
        setReducedMotion(e.matches);
      }
    };

    darkModeQuery.addEventListener('change', handleDarkModeChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // NEW: Update isDark when colorScheme changes
  useEffect(() => {
    if (colorScheme === 'system') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(darkModeQuery.matches);
    } else {
      setIsDark(colorScheme === 'dark');
    }
  }, [colorScheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Dark mode class
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Theme class
    root.setAttribute('data-theme', theme);

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('motion-reduce');
    } else {
      root.classList.remove('motion-reduce');
    }

    // Save preferences
    localStorage.setItem('theme-dark', isDark.toString());
    localStorage.setItem('theme-name', theme);
    localStorage.setItem('reduced-motion', reducedMotion.toString());
    localStorage.setItem('color-scheme', colorScheme); // NEW: Save color scheme

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        isDark ? '#1a1a1a' : '#ffffff'
      );
    }
  }, [isDark, theme, reducedMotion, colorScheme]);

  const toggleTheme = (): void => {
    // NEW: Toggle between light and dark (not system)
    if (colorScheme === 'system') {
      // If currently system, switch to opposite of current resolved theme
      setColorSchemeState(isDark ? 'light' : 'dark');
    } else {
      // Otherwise toggle between light and dark
      setColorSchemeState(colorScheme === 'dark' ? 'light' : 'dark');
    }
  };

  const setTheme = (newTheme: 'default' | 'premium' | 'minimal'): void => {
    setThemeState(newTheme);
  };

  // NEW: Set color scheme (light/dark/system)
  const setColorScheme = (scheme: ColorScheme): void => {
    setColorSchemeState(scheme);
  };

  // Utility functions for accessing design tokens
  const getColor = (path: string, fallback = '#000000'): string => {
    const keys = path.split('.');
    let current: any = _COLORS;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback;
      }
    }

    return typeof current === 'string' ? current : fallback;
  };

  const getGradient = (path: string, fallback = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'): string => {
    const keys = path.split('.');
    let current: any = GRADIENTS;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback;
      }
    }

    return typeof current === 'string' ? current : fallback;
  };

  const getShadow = (path: string, fallback = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'): string => {
    const keys = path.split('.');
    let current: any = SHADOWS;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback;
      }
    }

    return typeof current === 'string' ? current : fallback;
  };

  const value: ThemeContextType = {
    isDark,
    theme,
    reducedMotion,
    colorScheme, // NEW
    toggleTheme,
    setTheme,
    setColorScheme, // NEW
    colors: _COLORS,
    gradients: GRADIENTS,
    shadows: SHADOWS,
    blur: BLUR,
    radius: RADIUS,
    spacing: SPACING,
    getColor,
    getGradient,
    getShadow,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Script to prevent flash of unstyled content (FOUC)
 * Add this to the <head> of your document via layout.tsx
 */
export const ThemeScript = () => {
  const themeScript = `
    (function() {
      try {
        var colorScheme = localStorage.getItem('color-scheme') || 'system';
        var isDark = false;
        
        if (colorScheme === 'system') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          isDark = colorScheme === 'dark';
        }
        
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
        
        // Set meta theme-color
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'theme-color';
          document.head.appendChild(meta);
        }
        meta.content = isDark ? '#1a1a1a' : '#ffffff';
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
};
