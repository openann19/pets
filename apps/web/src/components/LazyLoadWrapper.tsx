'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useLazyLoad } from '@/utils/mobile-performance';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * LazyLoadWrapper - Optimizes performance by loading content only when visible
 */
export function LazyLoadWrapper({
  children,
  fallback,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
}: LazyLoadWrapperProps) {
  const { isVisible, elementRef } = useLazyLoad({
    threshold,
    rootMargin,
  });

  const defaultFallback = (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
  );

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

/**
 * LazyComponent - Higher-order component for lazy loading React components
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function LazyComponentWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LazyLoadWrapper><div /></LazyLoadWrapper>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * LazyImage - Optimized image component with lazy loading
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  onLoad,
  onError,
}: LazyImageProps) {
  const { isVisible, elementRef } = useLazyLoad({
    threshold: priority ? 0 : 0.1,
    rootMargin: priority ? '0px' : '50px',
  });

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible && (
        <motion.img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          onLoad={onLoad}
          onError={onError}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
}

/**
 * LazySection - For lazy loading entire page sections
 */
interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
  minHeight?: string;
}

export function LazySection({
  children,
  className = '',
  fallback,
  minHeight = '200px',
}: LazySectionProps) {
  const { isVisible, elementRef } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '100px',
  });

  const defaultFallback = (
    <div 
      className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      style={{ minHeight }}
    >
      <div className="p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={{ minHeight: isVisible ? 'auto' : minHeight }}
    >
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

/**
 * LazyList - For lazy loading lists with virtualization
 */
interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export function LazyList<T>({
  items,
  renderItem,
  className = '',
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5,
}: LazyListProps<T>) {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: Math.min(overscan, items.length) });

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + overscan, items.length);
    
    setVisibleRange({ start: Math.max(0, start - overscan), end });
  }, [itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div 
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
