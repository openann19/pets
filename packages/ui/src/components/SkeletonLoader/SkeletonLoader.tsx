import type { MotionStyle } from 'framer-motion';
import React from 'react';
import { MotionDiv } from '../../utils/Motion';

export interface SkeletonLoaderProps {
  /**
   * Width of the skeleton
   */
  width?: string | number;
  /**
   * Height of the skeleton
   */
  height?: string | number;
  /**
   * Border radius of the skeleton
   */
  borderRadius?: string | number;
  /**
   * Number of skeleton lines to render
   */
  lines?: number;
  /**
   * Spacing between skeleton lines
   */
  spacing?: string | number;
  /**
   * Animation variant
   */
  variant?: 'pulse' | 'wave' | 'shimmer';
  /**
   * Whether to show the skeleton
   */
  isLoading?: boolean;
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Children to render when not loading
   */
  children?: React.ReactNode;
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}

/**
 * Enhanced skeleton loader component with multiple variants and accessibility features
 * Provides consistent loading states across the application
 *
 * Usage:
 *   <SkeletonLoader width="100%" height="20px" />
 *   <SkeletonLoader lines={3} spacing="8px" variant="wave" />
 *   <SkeletonLoader isLoading={loading}>
 *     <ActualContent />
 *   </SkeletonLoader>
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  lines = 1,
  spacing = '8px',
  variant = 'pulse',
  isLoading = true,
  className = '',
  children,
  ariaLabel = 'Loading content'
}) => {
  // Animation variants
  const animationVariants = {
    pulse: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    wave: {
      x: ['-100%', '100%'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // Base skeleton styles
  const baseStyles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    backgroundColor: 'currentColor',
    opacity: 0.2
  };

  // Variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'wave':
        return {
          ...baseStyles,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          backgroundSize: '200% 100%',
          overflow: 'hidden',
          position: 'relative' as const
        };
      case 'shimmer':
        return {
          ...baseStyles,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          backgroundSize: '200% 100%',
          backgroundPosition: '200% 0'
        };
      default:
        return baseStyles;
    }
  };

  // Render skeleton lines
  const renderSkeletonLines = () => {
    if (lines === 1) {
      return (
        <MotionDiv
          style={getVariantStyles() as MotionStyle & React.CSSProperties}
          className={`skeleton-loader ${className}`}
          variants={animationVariants}
          animate={variant}
          aria-label={ariaLabel}
          role="status"
          aria-live="polite"
        />
      );
    }

    return (
      <div className={`skeleton-loader-container ${className}`} aria-label={ariaLabel} role="status" aria-live="polite">
        {Array.from({ length: lines }, (_, index) => (
          <MotionDiv
            key={index}
            style={{
              ...getVariantStyles(),
              marginBottom: index < lines - 1 ? (typeof spacing === 'number' ? `${spacing}px` : spacing) : 0
            } as MotionStyle & React.CSSProperties}
            className="skeleton-loader"
            variants={animationVariants}
            animate={variant}
            transition={{
              ...animationVariants[variant].transition,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    );
  };

  // If not loading, render children
  if (!isLoading && children) {
    return <>{children}</>;
  }

  // If not loading and no children, render nothing
  if (!isLoading) {
    return null;
  }

  return renderSkeletonLines();
};

/**
 * Predefined skeleton components for common use cases
 */
export const SkeletonCard: React.FC<{ className?: string; isLoading?: boolean; children?: React.ReactNode }> = ({
  className = '',
  isLoading = true,
  children
}) => (
  <SkeletonLoader
    width="100%"
    height="200px"
    borderRadius="12px"
    variant="shimmer"
    isLoading={isLoading}
    className={`skeleton-card ${className}`}
    ariaLabel="Loading card content"
  >
    {children}
  </SkeletonLoader>
);

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode
}> = ({
  lines = 3,
  className = '',
  isLoading = true,
  children
}) => (
    <SkeletonLoader
      width="100%"
      height="16px"
      borderRadius="4px"
      lines={lines}
      spacing="6px"
      variant="pulse"
      isLoading={isLoading}
      className={`skeleton-text ${className}`}
      ariaLabel="Loading text content"
    >
      {children}
    </SkeletonLoader>
  );

export const SkeletonAvatar: React.FC<{
  size?: number;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode
}> = ({
  size = 40,
  className = '',
  isLoading = true,
  children
}) => (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius="50%"
      variant="wave"
      isLoading={isLoading}
      className={`skeleton-avatar ${className}`}
      ariaLabel="Loading avatar"
    >
      {children}
    </SkeletonLoader>
  );

export const SkeletonButton: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode
}> = ({
  width = '120px',
  height = '40px',
  className = '',
  isLoading = true,
  children
}) => (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius="8px"
      variant="pulse"
      isLoading={isLoading}
      className={`skeleton-button ${className}`}
      ariaLabel="Loading button"
    >
      {children}
    </SkeletonLoader>
  );

export default SkeletonLoader;
