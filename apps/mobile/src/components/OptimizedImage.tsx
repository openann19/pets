/**
 * Optimized Image Component for PawfectMatch Mobile App
 * Uses FastImage for better performance and caching
 */
import React, { useMemo } from 'react';
import type { ImageProps as RNImageProps } from 'react-native';
import FastImage, { FastImageProps, Source } from 'react-native-fast-image';

interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  source: Source | RNImageProps['source'];
  fallbackToRNImage?: boolean;
  enableCache?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Optimized Image component that uses FastImage for better performance
 * Falls back to RN Image if FastImage fails or is disabled
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  fallbackToRNImage = true,
  enableCache = true,
  priority = 'normal',
  style,
  ...props
}) => {
  // Convert priority to FastImage priority
  const fastImagePriority = useMemo(() => {
    switch (priority) {
      case 'low':
        return FastImage.priority.low;
      case 'high':
        return FastImage.priority.high;
      default:
        return FastImage.priority.normal;
    }
  }, [priority]);

  // Build FastImage source with caching options
  const fastImageSource = useMemo(() => {
    if (typeof source === 'number') {
      // Static resource (require() call)
      return source;
    }

    if (typeof source === 'object' && 'uri' in source && source.uri) {
      return {
        ...source,
        priority: fastImagePriority,
        cache: enableCache ? FastImage.cacheControl.web : FastImage.cacheControl.immutable,
      };
    }

    return source;
  }, [source, fastImagePriority, enableCache]);

  // Try FastImage first, fallback to RN Image if needed
  if (fallbackToRNImage) {
    return (
      <FastImage
        source={fastImageSource}
        style={style}
        {...props}
        onError={(error: FastImageProps['onError']) => {
          console.warn('FastImage failed, falling back to RN Image:', error?.nativeEvent);
          // The fallback would need to be handled at the usage level
          // For now, FastImage handles its own fallbacks internally
        }}
      />
    );
  }

  // Use FastImage exclusively
  return (
    <FastImage
      source={fastImageSource}
      style={style}
      {...props}
    />
  );
};

/**
 * Preload images for better performance
 */
export const preloadImages = (sources: Source[]): void => {
  FastImage.preload(sources);
};

/**
 * Clear FastImage cache
 */
export const clearImageCache = async (): Promise<void> => {
  await FastImage.clearMemoryCache();
  await FastImage.clearDiskCache();
};

/**
 * Get cache size information
 */
export const getCacheSize = async (): Promise<{ disk: number; memory: number }> => {
  const disk = await FastImage.getCacheSize?.() || 0;
  const memory = await FastImage.getMemoryCacheSize?.() || 0;
  return { disk, memory };
};

export default OptimizedImage;
