/**
 * 🚀 PERFORMANCE OPTIMIZER UTILITIES
 * Advanced performance optimization utilities for React components
 * Features: Memoization, lazy loading, and performance monitoring
 */
import { useMemo, useCallback, useRef, useEffect } from 'react';
// Memoization utilities
export const useStableCallback = (callback) => {
    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);
    return useCallback((...args) => {
        return callbackRef.current(...args);
    }, []);
};
export const useStableMemo = (factory, deps) => {
    return useMemo(factory, deps);
};
// Debounce utility
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);
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
// Throttle utility
export const useThrottle = (callback, delay) => {
    const lastRun = useRef(Date.now());
    return useCallback((...args) => {
        if (Date.now() - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = Date.now();
        }
    }, [callback, delay]);
};
// Intersection Observer for lazy loading
export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = React.useState(false);
    const targetRef = useRef(null);
    useEffect(() => {
        const target = targetRef.current;
        if (!target)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);
        observer.observe(target);
        return () => {
            observer.unobserve(target);
        };
    }, [options]);
    return { targetRef, isIntersecting };
};
// Performance monitoring
export const usePerformanceMonitor = (componentName) => {
    const renderCount = useRef(0);
    const startTime = useRef(performance.now());
    useEffect(() => {
        renderCount.current += 1;
        if (process.env.NODE_ENV === 'development') {
            const endTime = performance.now();
            const renderTime = endTime - startTime.current;
            console.log(`[Performance] ${componentName}:`, {
                renderCount: renderCount.current,
                renderTime: `${renderTime.toFixed(2)}ms`,
            });
            startTime.current = endTime;
        }
    });
    return {
        renderCount: renderCount.current,
        resetRenderCount: () => {
            renderCount.current = 0;
        },
    };
};
// Image optimization utilities
export const optimizeImageUrl = (url, options = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;
    // For Unsplash images
    if (url.includes('unsplash.com')) {
        const baseUrl = url.split('?')[0];
        const params = new URLSearchParams();
        if (width)
            params.set('w', width.toString());
        if (height)
            params.set('h', height.toString());
        params.set('q', quality.toString());
        params.set('fm', format);
        params.set('fit', 'crop');
        return `${baseUrl}?${params.toString()}`;
    }
    // For other image services, return original URL
    return url;
};
// Bundle size optimization
export const createLazyComponent = (importFunc) => {
    return React.lazy(importFunc);
};
// Memory management
export const useCleanup = (cleanupFn) => {
    useEffect(() => {
        return cleanupFn;
    }, [cleanupFn]);
};
// Animation performance optimization
export const useAnimationFrame = (callback) => {
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const animate = useCallback((time) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback();
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }, [callback]);
    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [animate]);
};
// Virtual scrolling utilities
export const useVirtualScroll = (itemCount, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, itemCount);
    const visibleItems = useMemo(() => {
        const items = [];
        for (let i = startIndex; i < endIndex; i++) {
            items.push({
                index: i,
                style: {
                    position: 'absolute',
                    top: i * itemHeight,
                    height: itemHeight,
                    width: '100%',
                },
            });
        }
        return items;
    }, [startIndex, endIndex, itemHeight]);
    const totalHeight = itemCount * itemHeight;
    return {
        visibleItems,
        totalHeight,
        onScroll: (e) => {
            setScrollTop(e.currentTarget.scrollTop);
        },
    };
};
// Performance metrics collection
export const collectPerformanceMetrics = () => {
    if (typeof window === 'undefined')
        return null;
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    return {
        // Core Web Vitals
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        lcp: 0, // Would need to be measured with PerformanceObserver
        fid: 0, // Would need to be measured with PerformanceObserver
        cls: 0, // Would need to be measured with PerformanceObserver
        // Navigation timing
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.connectEnd - navigation.secureConnectionStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        domComplete: navigation.domComplete - navigation.navigationStart,
        // Memory usage
        memory: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
        } : null,
    };
};
// Export React for the utilities that need it
import React from 'react';
//# sourceMappingURL=PerformanceOptimizer.js.map