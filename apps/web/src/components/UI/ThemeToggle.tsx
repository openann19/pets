'use client';

import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Light mode"
      >
        <SunIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Dark mode"
      >
        <MoonIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="System theme"
      >
        <ComputerDesktopIcon className="w-5 h-5" />
      </button>
    </div>
  );
}