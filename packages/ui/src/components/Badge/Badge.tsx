import React from 'react';

export interface BadgeProps {
  /**
   * Badge content
   */
  children?: React.ReactNode;

  /**
   * Badge variant
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Badge size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Remove padding (dot style)
   */
  dot?: boolean;

  /**
   * Outline style
   */
  outline?: boolean;

  /**
   * Accessible label for screen readers
   */
  'aria-label'?: string;

  /**
   * ARIA role override
   */
  role?: string;

  /**
   * Tab index for accessibility
   */
  tabIndex?: number;
}

/**
 * A badge component for displaying status, labels, or counts
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  dot = false,
  outline = false
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  // Color tokens (add dark: classes for dark mode)
  const variantClasses = {
    default: outline
      ? 'border border-[var(--pm-border)] text-[var(--pm-text)] bg-transparent dark:border-[var(--pm-border-dark)] dark:text-[var(--pm-text-dark)]'
      : 'bg-[var(--pm-surface)] text-[var(--pm-text)] dark:bg-[var(--pm-surface-dark)] dark:text-[var(--pm-text-dark)]',
    primary: outline
      ? 'border border-[var(--pm-primary)] text-[var(--pm-primary)] bg-transparent dark:border-[var(--pm-primary-dark)] dark:text-[var(--pm-primary-dark)]'
      : 'bg-[var(--pm-primaryLight)] text-[var(--pm-textInverse)] dark:bg-[var(--pm-primaryDark)] dark:text-[var(--pm-textInverse-dark)]',
    secondary: outline
      ? 'border border-[var(--pm-secondary)] text-[var(--pm-secondary)] bg-transparent dark:border-[var(--pm-secondary)] dark:text-[var(--pm-secondary)]'
      : 'bg-[var(--pm-secondaryLight)] text-[var(--pm-text)] dark:bg-[var(--pm-secondary)] dark:text-[var(--pm-text-dark)]',
    success: outline
      ? 'border border-[var(--pm-success)] text-[var(--pm-success)] bg-transparent dark:border-[var(--pm-successLight)] dark:text-[var(--pm-successLight)]'
      : 'bg-[var(--pm-successLight)] text-[var(--pm-success)] dark:bg-[var(--pm-success)] dark:text-[var(--pm-successLight)]',
    warning: outline
      ? 'border border-[var(--pm-warning)] text-[var(--pm-warning)] bg-transparent dark:border-[var(--pm-warningLight)] dark:text-[var(--pm-warningLight)]'
      : 'bg-[var(--pm-warningLight)] text-[var(--pm-warning)] dark:bg-[var(--pm-warning)] dark:text-[var(--pm-warningLight)]',
    error: outline
      ? 'border border-[var(--pm-error)] text-[var(--pm-error)] bg-transparent dark:border-[var(--pm-errorLight)] dark:text-[var(--pm-errorLight)]'
      : 'bg-[var(--pm-errorLight)] text-[var(--pm-error)] dark:bg-[var(--pm-error)] dark:text-[var(--pm-errorLight)]',
    info: outline
      ? 'border border-[var(--pm-accent)] text-[var(--pm-accent)] bg-transparent dark:border-[var(--pm-accentLight)] dark:text-[var(--pm-accentLight)]'
      : 'bg-[var(--pm-accentLight)] text-[var(--pm-accent)] dark:bg-[var(--pm-accent)] dark:text-[var(--pm-accentLight)]',
  };

  const sizeClasses = {
    small: dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs',
    medium: dot ? 'w-3 h-3' : 'px-2.5 py-0.5 text-sm',
    large: dot ? 'w-4 h-4' : 'px-3 py-1 text-base'
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={props['aria-label']}
      role={props.role || 'status'}
      tabIndex={props.tabIndex}
    >
      {!dot && children}
    </span>
  );
};
