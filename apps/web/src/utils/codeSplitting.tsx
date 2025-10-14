/**
 * 🚀 ADVANCED CODE SPLITTING & LAZY LOADING
 * Production-ready code splitting with preloading and error boundaries
 */

import type { ComponentType } from 'react';
import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { logger } from '../services/logger';

// ====== LAZY LOADING UTILITIES ======
class CodeSplittingManager {
  private static preloadedComponents = new Set<string>();
  private static loadingPromises = new Map<string, Promise<Record<string, unknown>>>();

  /**
   * Create lazy component with error boundary and loading fallback
   */
  static createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string,
    fallback?: React.ReactNode,
  ): ComponentType<Record<string, unknown>> {
    const LazyComponent = lazy(importFn);

    const WrappedComponent = (props: Record<string, unknown>) => (
      <ErrorBoundary
        fallback={
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Failed to load {componentName}</p>
          </div>
        }
        onError={(error, errorInfo) => {
          logger.error(`Error loading ${componentName}`, { error, errorInfo });
        }}
      >
        <Suspense
          fallback={fallback || <ComponentLoadingFallback componentName={componentName} />}
        >
          {/* @ts-expect-error: Lazy component props are inherently untyped at creation time, but safe at runtime when used correctly */}
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );

    WrappedComponent.displayName = `Lazy${componentName}`;
    return WrappedComponent;
  }

  /**
   * Preload component for better performance
   */
  static async preloadComponent(
    importFn: () => Promise<Record<string, unknown>>,
    componentName: string,
  ): Promise<Record<string, unknown> | void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    if (this.loadingPromises.has(componentName)) {
      return await this.loadingPromises.get(componentName);
    }

    const promise = importFn()
      .then((module) => {
        this.preloadedComponents.add(componentName);
        this.loadingPromises.delete(componentName);
        return module;
      })
      .catch((error) => {
        logger.error(`Failed to preload ${componentName}`, { error });
        this.loadingPromises.delete(componentName);
        throw error;
      });

    this.loadingPromises.set(componentName, promise);
    return await promise;
  }

  /**
   * Preload multiple components
   */
  static async preloadComponents(
    components: { importFn: () => Promise<Record<string, unknown>>; name: string }[],
  ): Promise<PromiseSettledResult<Record<string, unknown> | void>[]> {
    const promises = components.map(({ importFn, name }) => this.preloadComponent(importFn, name));
    return await Promise.allSettled(promises);
  }

  /**
   * Get preload status
   */
  static isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }
}

// ====== LOADING FALLBACK COMPONENT ======
const ComponentLoadingFallback = ({ componentName }: { componentName: string }) => (
  <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <p className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
      <p className="text-sm text-gray-500">Loading {componentName}...</p>
    </div>
  </div>
);

// ====== ROUTE-BASED CODE SPLITTING ======
export const createRouteLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  routeName: string,
): ComponentType<Record<string, unknown>> =>
  CodeSplittingManager.createLazyComponent(
    importFn,
    routeName,
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading {routeName}</h2>
        <p className="text-gray-500">Please wait while we load the page...</p>
      </div>
    </div>,
  );

// ====== COMPONENT-BASED CODE SPLITTING ======
export const createComponentLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  componentName: string,
): ComponentType<Record<string, unknown>> =>
  CodeSplittingManager.createLazyComponent(
    importFn,
    componentName,
    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-300 h-8 w-8" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
    </div>,
  );

// ====== PRELOADING STRATEGIES ======
class PreloadingStrategies {
  /**
   * Preload on hover
   */
  static preloadOnHover(importFn: () => Promise<Record<string, unknown>>, componentName: string) {
    return {
      onMouseEnter: () => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      },
      onTouchStart: () => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      },
    };
  }

  /**
   * Preload on intersection
   */
  static preloadOnIntersection(
    importFn: () => Promise<Record<string, unknown>>,
    componentName: string,
  ) {
    return {
      ref: (node: HTMLElement | null) => {
        if (node && !CodeSplittingManager.isPreloaded(componentName)) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  CodeSplittingManager.preloadComponent(importFn, componentName);
                  observer.disconnect();
                }
              });
            },
            { threshold: 0.1 },
          );
          observer.observe(node);
        }
      },
    };
  }

  /**
   * Preload on idle
   */
  static preloadOnIdle(importFn: () => Promise<Record<string, unknown>>, componentName: string) {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (
        window as Window & { requestIdleCallback: (callback: () => void) => void }
      ).requestIdleCallback(() => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      });
    } else {
      setTimeout(() => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      }, 100);
    }
  }
}

// ====== BUNDLE ANALYSIS ======
class BundleAnalyzer {
  private static chunkSizes = new Map<string, number>();

  /**
   * Track chunk size
   */
  static trackChunkSize(chunkName: string, size: number): void {
    this.chunkSizes.set(chunkName, size);
  }

  /**
   * Get bundle statistics
   */
  static getBundleStats(): {
    totalChunks: number;
    totalSize: number;
    averageSize: number;
    largestChunk: { name: string; size: number };
    smallestChunk: { name: string; size: number };
  } {
    const chunks = Array.from(this.chunkSizes.entries());
    const totalSize = chunks.reduce((sum, [, size]) => sum + size, 0);
    const averageSize = totalSize / chunks.length;

    const sortedChunks = chunks.sort(([, a], [, b]) => b - a);
    const largestChunk = sortedChunks[0] || ['', 0];
    const smallestChunk = sortedChunks[sortedChunks.length - 1] || ['', 0];

    return {
      totalChunks: chunks.length,
      totalSize,
      averageSize,
      largestChunk: { name: largestChunk[0], size: largestChunk[1] },
      smallestChunk: { name: smallestChunk[0], size: smallestChunk[1] },
    };
  }
}

// ====== EXPORTS ======
export { BundleAnalyzer, CodeSplittingManager, PreloadingStrategies };
