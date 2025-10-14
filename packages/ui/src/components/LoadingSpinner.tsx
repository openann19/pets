import React from 'react';

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  'aria-label'?: string;
}

/**
 * Universal loading spinner for all flows
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  color = 'var(--pm-primary)',
  className = '',
  'aria-label': ariaLabel = 'Loading...'
}) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-label={ariaLabel}
    role="status"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
      opacity="0.2"
    />
    <path
      d="M22 12a10 10 0 01-10 10"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.9"
    />
  </svg>
);

export default LoadingSpinner;
