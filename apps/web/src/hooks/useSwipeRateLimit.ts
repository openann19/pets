'use client';

import { useRef, useCallback } from 'react';
import { logger } from '../services/logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  debounceMs?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 1000,
  debounceMs: 300,
};

/**
 * Hook for rate-limiting and debouncing swipe actions
 * Prevents spam and reduces backend load
 */
export function useSwipeRateLimit(config: Partial<RateLimitConfig> = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const requestTimestamps = useRef<number[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRateLimited = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - fullConfig.windowMs;

    // Remove old timestamps outside the window
    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => timestamp > windowStart,
    );

    // Check if we've exceeded the limit
    if (requestTimestamps.current.length >= fullConfig.maxRequests) {
      logger.warn('Swipe rate limit exceeded', {
        requests: requestTimestamps.current.length,
        limit: fullConfig.maxRequests,
        window: fullConfig.windowMs,
      });
      return true;
    }

    return false;
  }, [fullConfig.maxRequests, fullConfig.windowMs]);

  const recordRequest = useCallback(() => {
    requestTimestamps.current.push(Date.now());
  }, []);

  const debouncedExecute = useCallback(
    <T extends unknown[]>(fn: (...args: T) => Promise<void> | void, ...args: T): void => {
      // Clear any pending timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        if (!isRateLimited()) {
          recordRequest();
          fn(...args);
          debounceTimeoutRef.current = null;
        } else {
          logger.warn('Swipe action blocked - rate limited');

          // Dispatch event to show user feedback
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('swipe-rate-limited', {
                detail: { message: 'Please slow down! Too many swipes.' },
              }),
            );
          }
        }
      }, fullConfig.debounceMs);
    },
    [isRateLimited, recordRequest, fullConfig.debounceMs],
  );

  const executeWithRateLimit = useCallback(
    async <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      ...args: T
    ): Promise<R | null> => {
      if (isRateLimited()) {
        logger.warn('Swipe action blocked - rate limited');

        // Dispatch event to show user feedback
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('swipe-rate-limited', {
              detail: { message: 'Please slow down! Too many swipes.' },
            }),
          );
        }

        return null;
      }

      recordRequest();
      return await fn(...args);
    },
    [isRateLimited, recordRequest],
  );

  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  return {
    debouncedExecute,
    executeWithRateLimit,
    isRateLimited,
    cleanup,
  };
}
