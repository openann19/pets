/**
 * ⚡ PERFORMANCE OPTIMIZATIONS
 * Mobile performance optimizations based on Tinder clone best practices
 * Provides utilities for smooth, responsive mobile experience
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { logger } from '@pawfectmatch/core';
;

// Performance API extensions
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: PerformanceMemory;
}

interface WindowWithGC extends Window {
  gc?: () => void;
}

interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// Debounce utility for performance
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle utility for performance
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay],
  );
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit,
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
): {
  visibleItems: number[];
  totalHeight: number;
  offsetY: number;
  setScrollTop: (scrollTop: number) => void;
} => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, itemCount);

  const visibleItems = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);

  const totalHeight = itemCount * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Image optimization hook
export const useOptimizedImage = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {},
): {
  src: string;
  isLoaded: boolean;
  isError: boolean;
} => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');

  const { width = 400, height = 400, quality = 80, format = 'webp' } = options;

  useEffect(() => {
    if (!src) return;

    // Create optimized image URL
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('f', format);

    setOptimizedSrc(url.toString());
    setIsLoaded(false);
    setIsError(false);

    // Preload image
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
    };
    img.onerror = () => {
      setIsError(true);
    };
    img.src = url.toString();
  }, [src, width, height, quality, format]);

  return {
    src: optimizedSrc,
    isLoaded,
    isError,
  };
};

// Memory management hook
export const useMemoryOptimization = (): {
  memoryUsage: number;
  clearCache: () => void;
} => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    const updateMemoryUsage = (): void => {
      if ('memory' in performance) {
        const { memory } = performance as PerformanceWithMemory;
        setMemoryUsage(memory.usedJSHeapSize / memory.jsHeapSizeLimit);
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const clearCache = useCallback(() => {
    // Clear various caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // Clear localStorage if needed
    // localStorage.clear();

    // Force garbage collection if available
    if ('gc' in window) {
      (window as WindowWithGC).gc?.();
    }
  }, []);

  return {
    memoryUsage,
    clearCache,
  };
};

// Network optimization hook
export const useNetworkOptimization = (): {
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
  isSlowConnection: boolean;
  shouldReduceQuality: boolean;
} => {
  const [connection, setConnection] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null>(null);

  useEffect(() => {
    if ('connection' in navigator) {
      const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
      if (conn) {
        setConnection({
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
        });

        const handleChange = (): void => {
          if (conn) {
            setConnection({
              effectiveType: conn.effectiveType,
              downlink: conn.downlink,
              rtt: conn.rtt,
            });
          }
        };

        // Use proper event listener types for NetworkInformation
        const networkConn = conn as NetworkInformation & EventTarget;
        if ('addEventListener' in networkConn) {
          networkConn.addEventListener('change', handleChange);
          return () => {
            if (networkConn && 'removeEventListener' in networkConn) {
              networkConn.removeEventListener('change', handleChange);
            }
          };
        }
      }
    }
    return undefined;
  }, []);

  const isSlowConnection =
    connection !== null &&
    (connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.downlink < 1);

  const shouldReduceQuality =
    connection !== null &&
    (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

  return {
    connection,
    isSlowConnection,
    shouldReduceQuality,
  };
};

// Animation performance hook
export const useAnimationPerformance = (): {
  fps: number;
  shouldReduceAnimations: boolean;
} => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const measureFPS = (): void => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }, []);

  const shouldReduceAnimations = fps < 30;

  return {
    fps,
    shouldReduceAnimations,
  };
};

// Bundle size optimization
export const useBundleOptimization = (): {
  isLoaded: boolean;
  lazyImport: (moduleName: string) => Promise<unknown>;
} => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Mark as loaded after initial render
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const lazyImport = useCallback(
    async (moduleName: string): Promise<unknown> => {
      if (!isLoaded) return null;

      try {
        const loadedModule = await import(moduleName);
        return loadedModule;
      } catch (error) {
        logger.error(`Failed to load module: ${moduleName}`, { error });
        return null;
      }
    },
    [isLoaded],
  );

  return {
    isLoaded,
    lazyImport,
  };
};

// Touch optimization for mobile
export const useTouchOptimization = (): {
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  getSwipeDirection: () => 'left' | 'right' | 'up' | 'down' | null;
} => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) {
      setTouchEnd({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
    }
  }, []);

  const getSwipeDirection = useCallback((): 'left' | 'right' | 'up' | 'down' | null => {
    if (!touchStart || !touchEnd) return null;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;

    // Minimum swipe distance and time
    if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) return null;
    if (deltaTime > 500) return null;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchEnd,
    getSwipeDirection,
  };
};

// Performance monitoring
export const usePerformanceMonitoring = (): {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
} | null => {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  } | null>(null);

  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics((prev) => ({
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              firstContentfulPaint: prev?.firstContentfulPaint ?? 0,
              largestContentfulPaint: prev?.largestContentfulPaint ?? 0,
              firstInputDelay: prev?.firstInputDelay ?? 0,
              cumulativeLayoutShift: prev?.cumulativeLayoutShift ?? 0,
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

      return () => {
        observer.disconnect();
      };
    }
    return undefined;
  }, []);

  return metrics;
};
