import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import type { ColorSchemeName } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { GlobalStyles, Colors, Shadows } from '../styles/GlobalStyles';
import { GlobalStylesDark, ColorsDark, ShadowsDark } from '../styles/DarkTheme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  white: string;
  black: string;
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  glassWhite: string;
  glassWhiteLight: string;
  glassWhiteDark: string;
  glassDark: string;
  glassDarkMedium: string;
  glassDarkStrong: string;
  gradientPrimary: string[];
  gradientSecondary: string[];
  gradientAccent: string[];
  gradientSuccess: string[];
  gradientWarning: string[];
  gradientError: string[];
  // Additional properties for UI components
  text: string;
  textSecondary: string;
  card: string;
  background: string;
  border: string;
  inputBackground: string;
}

export interface ThemeStyles {
  container: Record<string, unknown>;
  backgroundGradient: Record<string, unknown>;
  safeArea: Record<string, unknown>;
  headerBlur: Record<string, unknown>;
  headerContent: Record<string, unknown>;
  heading2: Record<string, unknown>;
  bodySmall: Record<string, unknown>;
  scrollContainer: Record<string, unknown>;
  [key: string]: Record<string, unknown>;
}

export interface ThemeShadows {
  small: Record<string, unknown>;
  medium: Record<string, unknown>;
  large: Record<string, unknown>;
  [key: string]: Record<string, unknown>;
}

export interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  styles: ThemeStyles;
  shadows: ThemeShadows;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@pawfectmatch_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Calculate if we should use dark theme
  const isDark = React.useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Get current theme colors and styles
  const colors = isDark ? ColorsDark : Colors;
  const styles = isDark ? GlobalStylesDark : GlobalStyles;
  const baseShadows = isDark ? ShadowsDark : Shadows;
  const bs = baseShadows as unknown as Record<string, Record<string, unknown>>;
  const themeShadows: ThemeShadows = {
    small: bs['sm'] ?? {},
    medium: bs['md'] ?? {},
    large: bs['lg'] ?? {},
    ...bs,
  };

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        logger.warn('Failed to load theme preference:', { error });
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => { subscription?.remove(); };
  }, []);

  // Save theme preference to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      logger.warn('Failed to save theme preference:', { error });
    }
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = (): void => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const contextValue: ThemeContextType = {
    isDark,
    themeMode,
    colors,
    styles,
    shadows: themeShadows,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
