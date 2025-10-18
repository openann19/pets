import React, { useEffect, useState, type JSX } from 'react';
import { useAnimation } from '../../hooks/useAnimation';
import { useTheme } from '../../hooks/useTheme';

export interface DarkModeToggleProps {
  /**
   * Size of the toggle button
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Visual variant of the toggle
   */
  variant?: 'switch' | 'icon' | 'minimal' | 'animated';

  /**
   * Position of the label relative to the toggle
   */
  labelPosition?: 'left' | 'right' | 'top' | 'bottom' | 'none';

  /**
   * Custom label for light mode
   */
  lightModeLabel?: string;

  /**
   * Custom label for dark mode
   */
  darkModeLabel?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to show icon animation
   */
  animated?: boolean;

  /**
   * Whether to show a subtle pulsing effect when mode changes
   */
  pulseOnChange?: boolean;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * Callback when the theme is changed
   */
  onThemeChange?: (isDark: boolean) => void;
}

/**
 * A modern toggle component for switching between light and dark modes
 * Implements the latest 2025 UI/UX best practices
 */
export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  size = 'medium',
  variant = 'animated',
  labelPosition = 'none',
  lightModeLabel = 'Light',
  darkModeLabel = 'Dark',
  className = '',
  animated = true,
  pulseOnChange = true,
  ariaLabel = 'Toggle dark mode',
  onThemeChange
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { animate } = useAnimation();
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Handle theme toggle
  const handleToggle = (): void => {
    toggleTheme();

    if (animated !== null && animated !== undefined) {
      setIsAnimating(true);
      setTimeout(() => { setIsAnimating(false); }, 700);
    }

    if (pulseOnChange !== null && pulseOnChange !== undefined) {
      animate('bounce');
    }

    if (onThemeChange !== null && onThemeChange !== undefined) {
      onThemeChange(!isDarkMode);
    }
  };

  // Run initial animation on mount
  useEffect(() => {
    if (animated !== null && animated !== undefined) {
      setIsAnimating(true);
      setTimeout(() => { setIsAnimating(false); }, 700);
    }
  }, [animated]);

  // Size class mapping
  const sizeClasses = {
    small: {
      container: 'h-6 w-12',
      switch: 'h-5 w-5',
      icon: 'h-4 w-4',
      text: 'text-xs'
    },
    medium: {
      container: 'h-8 w-16',
      switch: 'h-6 w-6',
      icon: 'h-5 w-5',
      text: 'text-sm'
    },
    large: {
      container: 'h-10 w-20',
      switch: 'h-8 w-8',
      icon: 'h-6 w-6',
      text: 'text-base'
    }
  };

  // Label position classes
  const labelPositionClasses = {
    left: 'flex-row-reverse',
    right: 'flex-row',
    top: 'flex-col-reverse',
    bottom: 'flex-col',
    none: ''
  };

  // Label spacing classes
  const labelSpacingClasses = {
    left: 'mr-3',
    right: 'ml-3',
    top: 'mb-2',
    bottom: 'mt-2',
    none: ''
  };

  // Render switch variant
  const renderSwitch = (): JSX.Element => (
    <div
      className={`
        relative transition-colors duration-300 rounded-full cursor-pointer
        ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}
        ${sizeClasses[size].container}
      `}
      onClick={handleToggle}
      role="switch"
      aria-checked={isDarkMode}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div
        className={`
          absolute top-1/2 transform -translate-y-1/2 rounded-full shadow-md transition-all duration-300
          ${sizeClasses[size].switch}
          ${isDarkMode ? 'translate-x-full bg-white right-1' : 'translate-x-0 bg-white left-1'}
        `}
      />
    </div>
  );

  // Render icon variant
  const renderIcon = (): JSX.Element => (
    <button
      onClick={handleToggle}
      className={`
        p-2 rounded-full transition-colors duration-300
        ${isDarkMode
          ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        }
      `}
      aria-label={ariaLabel}
    >
      {isDarkMode ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={sizeClasses[size].icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
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
          xmlns="http://www.w3.org/2000/svg"
          className={sizeClasses[size].icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
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

  // Render minimal variant
  const renderMinimal = (): JSX.Element => (
    <button
      onClick={handleToggle}
      className={`
        text-sm font-medium transition-colors duration-300
        ${isDarkMode
          ? 'text-gray-300 hover:text-white'
          : 'text-gray-600 hover:text-gray-900'
        }
      `}
      aria-label={ariaLabel}
    >
      {isDarkMode ? darkModeLabel : lightModeLabel}
    </button>
  );

  // Render animated variant
  const renderAnimated = (): JSX.Element => (
    <button
      onClick={handleToggle}
      className={`
        relative rounded-full overflow-hidden transition-all duration-300 cursor-pointer
        ${isDarkMode
          ? 'bg-gray-800 border border-gray-600'
          : 'bg-blue-50 border border-blue-200'
        }
        ${sizeClasses[size].container}
      `}
      aria-label={ariaLabel}
    >
      {/* Sun */}
      <div
        className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700
          ${isDarkMode ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
        `}
      >
        <div className={`relative ${sizeClasses[size].icon}`}>
          <div className={`
            absolute inset-0 rounded-full
            ${isAnimating ? 'animate-pulse-fast' : ''}
            bg-yellow-400
          `} />
          {/* Sun rays */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute bg-yellow-400 rounded-full
                ${isAnimating ? 'animate-grow-rays' : ''}
                ${size === 'small' ? 'h-0.5 w-2' : size === 'medium' ? 'h-0.5 w-2.5' : 'h-1 w-3'}
              `}
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
                transform: `rotate(${i * 45}deg) translateY(-${size === 'small' ? 5 : size === 'medium' ? 7 : 9}px)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Moon */}
      <div
        className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700
          ${isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
        `}
      >
        <div className={`
          relative rounded-full
          ${isAnimating ? 'animate-pulse-slow' : ''}
          ${size === 'small' ? 'h-3.5 w-3.5' : size === 'medium' ? 'h-4.5 w-4.5' : 'h-6 w-6'}
          bg-gray-300
        `}>
          <div className={`
            absolute rounded-full bg-gray-800
            ${size === 'small' ? '-top-1 -right-0.5 h-2.5 w-2.5' : size === 'medium' ? '-top-1 -right-1 h-3.5 w-3.5' : '-top-1.5 -right-1.5 h-5 w-5'}
          `} />
        </div>
      </div>

      {/* Stars */}
      {isDarkMode !== undefined && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute bg-white rounded-full
                ${isAnimating ? 'animate-twinkle' : ''}
              `}
              style={{
                height: size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px',
                width: size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px',
                top: `${20 + i * 15}%`,
                left: `${15 + i * 25}%`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </>
      )}
    </button>
  );

  // Render variant based on prop
  const renderVariant = (): JSX.Element => {
    switch (variant) {
      case 'switch':
        return renderSwitch();
      case 'icon':
        return renderIcon();
      case 'minimal':
        return renderMinimal();
      case 'animated':
        return renderAnimated();
      default:
        return renderAnimated();
    }
  };

  // Render label based on position
  const renderLabel = (): JSX.Element | null => {
    if (labelPosition === 'none') return null;

    return (
      <span className={`${sizeClasses[size].text} font-medium text-gray-700 dark:text-gray-300`}>
        {isDarkMode ? darkModeLabel : lightModeLabel}
      </span>
    );
  };

  return (
    <div
      className={`
        inline-flex items-center
        ${labelPositionClasses[labelPosition]}
        ${className}
      `}
    >
      {renderVariant()}
      {labelPosition !== 'none' && (
        <div className={labelSpacingClasses[labelPosition]}>
          {renderLabel()}
        </div>
      )}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        
        @keyframes pulse-fast {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes pulse-slow {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes grow-rays {
          0% { transform: rotate(VAR(--rotation)) translateY(VAR(--translation)) scale(0.8); }
          50% { transform: rotate(VAR(--rotation)) translateY(VAR(--translation)) scale(1.2); }
          100% { transform: rotate(VAR(--rotation)) translateY(VAR(--translation)) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DarkModeToggle;
