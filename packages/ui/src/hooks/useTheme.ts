import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';
interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDarkMode: false,
  setTheme: () => {},
  toggleTheme: () => {}
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from local storage or default to system
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pawfect-theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme as Theme;
      }
    }
    return 'system';
  });
  
  // State to track if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Set theme and persist to storage
  const setTheme = useCallback((newTheme: Theme): void => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pawfect-theme', newTheme);
    }
  }, []);
  
  // Toggle between light and dark modes
  const toggleTheme = useCallback((): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);
  
  // Effect to apply theme to document and detect system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to update theme based on current settings
    const updateTheme = (): void => {
      const isSystemDark = mediaQuery.matches;
      const shouldUseDarkMode = 
        theme === 'dark' || 
        (theme === 'system' && isSystemDark);
      
      document.documentElement.classList.toggle('dark', shouldUseDarkMode);
      setIsDarkMode(shouldUseDarkMode);
    };
    
    // Initial setup
    updateTheme();
    
    // Listen for system preference changes
    const listener = (): void => {
      updateTheme();
    };
    mediaQuery.addEventListener('change', listener);
    
    return () => { mediaQuery.removeEventListener('change', listener); };
  }, [theme]);
  
  const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    setTheme,
    toggleTheme
  };
  
  return React.createElement(ThemeContext.Provider, { value: contextValue }, children);
};

/**
 * Custom hook to access the theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  // If no context found, return a default implementation
  if (!context) {
    const isDarkMode = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false;
    
    return {
      theme: 'system' as Theme,
      isDarkMode,
      setTheme: (_theme: Theme): void => {},
      toggleTheme: (): void => {}
    };
  }
  
  return context;
};

export default useTheme;
