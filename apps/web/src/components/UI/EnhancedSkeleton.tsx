'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  animation?: 'pulse' | 'shimmer' | 'wave';
  width?: number | string;
  height?: number | string;
  count?: number;
}

export default function EnhancedSkeleton({
  className = '',
  variant = 'text',
  animation = 'shimmer',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'rounded-2xl';
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      default:
        return 'animate-shimmer';
    }
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: width || 40, height: height || 40 };
      case 'card':
        return { width: width || '100%', height: height || 200 };
      case 'rectangular':
        return { width: width || '100%', height: height || 100 };
      default:
        return { width: width || '100%', height: height || 20 };
    }
  };

  const dimensions = getDefaultDimensions();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={`
            bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
            dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
            ${getVariantStyles()}
            ${getAnimationClass()}
            ${className}
            ${index > 0 ? 'mt-2' : ''}
          `}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            backgroundSize: '200% 100%'
          }}
        />
      ))}
    </>
  );
}

// Specialized skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <EnhancedSkeleton variant="rectangular" height={200} className="mb-4" />
      <EnhancedSkeleton variant="text" count={2} className="mb-2" />
      <div className="flex items-center gap-2 mt-4">
        <EnhancedSkeleton variant="circular" width={32} height={32} />
        <EnhancedSkeleton variant="text" width="60%" />
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <EnhancedSkeleton variant="circular" width={48} height={48} />
          <div className="flex-1">
            <EnhancedSkeleton variant="text" width="40%" className="mb-2" />
            <EnhancedSkeleton variant="text" width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <EnhancedSkeleton variant="circular" width={80} height={80} />
        <div className="flex-1">
          <EnhancedSkeleton variant="text" width="50%" className="mb-2" />
          <EnhancedSkeleton variant="text" width="30%" />
        </div>
      </div>
      <EnhancedSkeleton variant="text" count={3} />
    </div>
  );
}