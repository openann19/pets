'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
}

// Default blur placeholder for loading state
const DEFAULT_BLUR = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

export default function OptimizedImage({
  src,
  alt,
  width = 500,
  height = 500,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL = DEFAULT_BLUR,
  objectFit = 'cover',
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle external URLs
  const isExternal = src.startsWith('http') || src.startsWith('//');
  
  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400">Failed to load image</span>
      </div>
    );
  }

  if (isExternal) {
    // For external images, use regular img tag with loading="lazy"
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => setError(true)}
        style={{ objectFit }}
      />
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
        style={{ objectFit }}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => setError(true)}
      />
    </div>
  );
}