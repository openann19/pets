/**
 * 🌓 ULTRA PREMIUM THEME PROVIDER
 * Dark/Light/System modes with smooth transitions
 * localStorage persistence | CSS variables | WCAG 2.1 AA compliant
 */

'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
    /** Current theme setting (light/dark/system) */
    theme: Theme;
    /** Resolved theme after system preference (light/dark only) */
    resolvedTheme: ResolvedTheme;
    /** Set theme */
    setTheme: (theme: Theme) => void;
    /** Toggle between light and dark */
    toggleTheme: () => void;
    /** Check if currently in dark mode */
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'pawfectmatch-theme';

/**
 * Get system theme preference
 */
function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve theme to light or dark
 */
function resolveTheme(theme: Theme): ResolvedTheme {
    if (theme === 'system') {
        return getSystemTheme();
    }
    return theme;
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: ResolvedTheme) {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark');

    // Add resolved theme class
    root.classList.add(resolvedTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            'content',
            resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff'
        );
    }
}

interface ThemeProviderProps {
    children: ReactNode;
    /** Default theme if none is stored */
    defaultTheme?: Theme;
    /** Storage key for localStorage */
    storageKey?: string;
    /** Disable transitions on initial load */
    disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = STORAGE_KEY,
    disableTransitionOnChange = false,
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage or default
    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        const initialTheme = stored || defaultTheme;
        const resolved = resolveTheme(initialTheme);

        setThemeState(initialTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
        setMounted(true);
    }, [defaultTheme, storageKey]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const newResolvedTheme = e.matches ? 'dark' : 'light';
            setResolvedTheme(newResolvedTheme);
            applyTheme(newResolvedTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        const resolved = resolveTheme(newTheme);

        // Disable transitions during theme change if requested
        if (disableTransitionOnChange) {
            document.documentElement.style.setProperty('transition', 'none');
        }

        setThemeState(newTheme);
        setResolvedTheme(resolved);
        localStorage.setItem(storageKey, newTheme);
        applyTheme(resolved);

        // Re-enable transitions
        if (disableTransitionOnChange) {
            setTimeout(() => {
                document.documentElement.style.removeProperty('transition');
            }, 0);
        }
    };

    const toggleTheme = () => {
        // If system, toggle to opposite of current resolved theme
        // Otherwise toggle between light and dark
        if (theme === 'system') {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        } else {
            setTheme(theme === 'dark' ? 'light' : 'dark');
        }
    };

    const value: ThemeContextType = {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === 'dark',
    };

    // Prevent flash of unstyled content
    if (!mounted) {
        return null;
    }

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

/**
 * Theme toggle button component
 */
interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTheme(e.target.value as Theme);
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && (
                <label htmlFor="theme-select" className="text-sm font-medium">
                    Theme:
                </label>
            )}

            <select
                id="theme-select"
                value={theme}
                onChange={handleChange}
                className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                aria-label="Select theme"
            >
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="system">🖥️ System</option>
            </select>

            {/* Current resolved theme indicator */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
                ({resolvedTheme === 'dark' ? '🌙' : '☀️'})
            </span>
        </div>
    );
}

/**
 * Simple icon-based theme toggle button
 */
interface ThemeToggleIconProps {
    className?: string;
}

export function ThemeToggleIcon({ className = '' }: ThemeToggleIconProps) {
    const { toggleTheme, resolvedTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
            aria-label="Toggle theme"
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {resolvedTheme === 'dark' ? (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ) : (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            )}
        </button>
    );
}

/**
 * Script to prevent flash of unstyled content (FOUC)
 * Place this in the <head> of your document
 */
export const ThemeScript = () => {
    const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('${STORAGE_KEY}') || 'system';
        var resolved = theme;
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.classList.add(resolved);
        
        // Set meta theme-color
        var meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = resolved === 'dark' ? '#1a1a1a' : '#ffffff';
        document.head.appendChild(meta);
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
