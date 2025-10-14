import React from 'react';

export interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  count?: number;
}

/**
 * Universal skeleton loader for all flows
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 16,
  radius = 8,
  className = '',
  count = 1
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`bg-[var(--pm-surface)] dark:bg-[var(--pm-surface-dark)] animate-pulse ${className}`}
        style={{
          width,
          height,
          borderRadius: radius,
          marginBottom: 8
        }}
        aria-busy="true"
        aria-label="Loading..."
      />
    ))}
  </>
);

export default SkeletonLoader;
