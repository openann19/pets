'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { getAnalytics } from '../utils/analytics-system';

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => void;
  trackPageView: (page: string) => void;
  trackInteraction: (element: string, action: string, metadata?: Record<string, unknown>) => void;
  trackError: (error: Error, context?: Record<string, unknown>) => void;
  setUserId: (userId: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps): React.JSX.Element {
  const analytics = getAnalytics();

  useEffect(() => {
    // Track app initialization
    analytics.track('app_initialized', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      analytics.track('page_visibility_change', {
        hidden: document.hidden,
        timestamp: Date.now(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track performance metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        analytics.track('performance_metric', {
          name: entry.name,
          duration: entry.duration,
          type: entry.entryType,
        });
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  const trackEvent = (eventName: string, properties?: Record<string, unknown>): void => {
    analytics.track(eventName, properties);
  };

  const trackPageView = (page: string): void => {
    analytics.trackPageView(page);
  };

  const trackInteraction = (element: string, action: string, metadata?: Record<string, unknown>): void => {
    analytics.trackInteraction(element, action, metadata);
  };

  const trackError = (error: Error, context?: Record<string, unknown>): void => {
    analytics.trackError(error, context);
  };

  const setUserId = (userId: string): void => {
    analytics.setUserId(userId);
  };

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackError,
    setUserId,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
