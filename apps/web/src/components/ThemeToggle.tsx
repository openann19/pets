/**
 * 🌓 THEME TOGGLE COMPONENT
 * Premium dark mode toggle with light/dark/system modes
 * Smooth animations | Accessibility compliant
 */

'use client';

import type { ColorScheme } from '@/contexts/ThemeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = true }: ThemeToggleProps) {
  const { colorScheme, setColorScheme, isDark } = useTheme();

  const schemes: Array<{ value: ColorScheme; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '🖥️' },
  ];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Color Scheme
        </label>
      )}

      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {schemes.map((scheme) => {
          const isActive = colorScheme === scheme.value;

          return (
            <button
              key={scheme.value}
              onClick={() => setColorScheme(scheme.value)}
              className={`
                relative flex-1 px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-200
                ${isActive
                  ? 'text-white dark:text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
              aria-label={`Switch to ${scheme.label} mode`}
              aria-pressed={isActive}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="activeTheme"
                  className="absolute inset-0 bg-purple-600 dark:bg-purple-400 rounded-md"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              {/* Content */}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span role="img" aria-hidden="true">
                  {scheme.icon}
                </span>
                {scheme.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current resolved theme indicator */}
      {colorScheme === 'system' && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Currently using {isDark ? 'dark' : 'light'} mode based on system preference
        </p>
      )}
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
  const { toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-colors
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {isDark ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}
