/**
 * 🚀 PERFORMANCE OPTIMIZER UTILITIES
 * Advanced performance optimization utilities for React components
 * Features: Memoization, lazy loading, and performance monitoring
 */
export declare const useStableCallback: <T extends (...args: any[]) => any>(callback: T) => T;
export declare const useStableMemo: <T>(factory: () => T, deps: React.DependencyList) => T;
export declare const useDebounce: <T>(value: T, delay: number) => T;
export declare const useThrottle: <T extends (...args: any[]) => any>(callback: T, delay: number) => T;
export declare const useIntersectionObserver: (options?: IntersectionObserverInit) => {
    targetRef: React.RefObject<HTMLElement>;
    isIntersecting: boolean;
};
export declare const usePerformanceMonitor: (componentName: string) => {
    renderCount: number;
    resetRenderCount: () => void;
};
export declare const optimizeImageUrl: (url: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpg" | "png";
}) => string;
export declare const createLazyComponent: <T extends React.ComponentType<any>>(importFunc: () => Promise<{
    default: T;
}>) => React.LazyExoticComponent<T>;
export declare const useCleanup: (cleanupFn: () => void) => void;
export declare const useAnimationFrame: (callback: () => void) => void;
export declare const useVirtualScroll: (itemCount: number, itemHeight: number, containerHeight: number) => {
    visibleItems: {
        index: number;
        style: {
            position: "absolute";
            top: number;
            height: number;
            width: string;
        };
    }[];
    totalHeight: number;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
};
export declare const collectPerformanceMetrics: () => {
    fcp: number | undefined;
    lcp: number;
    fid: number;
    cls: number;
    dns: number;
    tcp: number;
    ssl: number;
    ttfb: number;
    download: number;
    domProcessing: number;
    domComplete: number;
    memory: {
        used: any;
        total: any;
        limit: any;
    } | null;
} | null;
import React from 'react';
//# sourceMappingURL=PerformanceOptimizer.d.ts.map