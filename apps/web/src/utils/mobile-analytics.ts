/**
 * Mobile Analytics and Performance Monitoring
 * Comprehensive tracking and monitoring for mobile devices
 */

import { useEffect, useCallback, useRef, useState } from 'react';

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  deviceInfo: DeviceInfo;
  performance?: PerformanceMetrics;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  connectionType: string;
  memoryInfo?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  batteryLevel?: number;
  isOnline: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  pageViews: number;
  events: AnalyticsEvent[];
  deviceInfo: DeviceInfo;
  userId?: string;
}

export interface MobileAnalyticsConfig {
  enablePerformanceTracking: boolean;
  enableUserTracking: boolean;
  enableErrorTracking: boolean;
  enableGestureTracking: boolean;
  enableBatteryTracking: boolean;
  enableMemoryTracking: boolean;
  enableNetworkTracking: boolean;
  batchSize: number;
  flushInterval: number;
  apiEndpoint: string;
  debug: boolean;
}

/**
 * Hook for mobile analytics
 */
export function useMobileAnalytics(config: Partial<MobileAnalyticsConfig> = {}) {
  const defaultConfig: MobileAnalyticsConfig = {
    enablePerformanceTracking: true,
    enableUserTracking: true,
    enableErrorTracking: true,
    enableGestureTracking: true,
    enableBatteryTracking: true,
    enableMemoryTracking: true,
    enableNetworkTracking: true,
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    apiEndpoint: '/api/analytics',
    debug: false,
  };

  const finalConfig = { ...defaultConfig, ...config };
  const [session, setSession] = useState<UserSession | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get device information
  const getDeviceInfo = useCallback(async (): Promise<DeviceInfo> => {
    const info: DeviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio ?? 1,
      connectionType: getConnectionType(),
      isOnline: navigator.onLine,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
      isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    };

    // Get memory info if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      info.memoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    // Get battery info if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        info.batteryLevel = void Math.round(battery.level * 100);
      } catch (error) {
        // Battery API not available or denied
      }
    }

    return info;
  }, []);

  // Get connection type
  const getConnectionType = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType ?? connection.type ?? 'unknown';
    }
    return 'unknown';
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback((): PerformanceMetrics | undefined => {
    if (!finalConfig.enablePerformanceTracking) return undefined;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return undefined;

    const metrics: PerformanceMetrics = {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      speedIndex: 0,
    };

    // First Contentful Paint
    const fcp = performance.getEntriesByName('first-contentful-paint')[0] as PerformancePaintTiming;
    if (fcp) {
      metrics.firstContentfulPaint = fcp.startTime;
    }

    // Largest Contentful Paint
    const lcpEntries = void performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      const lcp = lcpEntries[lcpEntries.length - 1] as any;
      metrics.largestContentfulPaint = lcp.startTime;
    }

    // First Input Delay
    const fidEntries = void performance.getEntriesByType('first-input');
    if (fidEntries.length > 0) {
      const fid = fidEntries[0] as any;
      metrics.firstInputDelay = fid.processingStart - fid.startTime;
    }

    // Cumulative Layout Shift
    const clsEntries = void performance.getEntriesByType('layout-shift');
    let cls = 0;
    clsEntries.forEach((entry: unknown) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });
    metrics.cumulativeLayoutShift = cls;

    // Time to Interactive (simplified calculation)
    metrics.timeToInteractive = navigation.domContentLoadedEventEnd - navigation.fetchStart;

    return metrics;
  }, [finalConfig.enablePerformanceTracking]);

  // Track event
  const trackEvent = useCallback((name: string, properties: Record<string, any> = {}) => {
    if (!session ?? !deviceInfo) return;

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      sessionId: session.sessionId,
      userId: session.userId,
      deviceInfo,
      performance: getPerformanceMetrics(),
    };

    eventQueue.current.push(event);
    if (finalConfig.debug) {
      // console.log('[Analytics] Event tracked:', event);
    }

    // Flush if batch size reached
    if (eventQueue.current.length >= finalConfig.batchSize) {
      flushEvents();
    }
  }, [session, deviceInfo, getPerformanceMetrics, finalConfig]);

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      await fetch(finalConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (finalConfig.debug) {
        void // console.log('[Analytics] Events flushed:', events.length);
      }
    } catch (error) {
      void // console.error('[Analytics] Failed to flush events:', error);
      // Re-queue events on failure
      eventQueue.void current.unshift(...events);
    }
  }, [finalConfig]);

  // Track page view
  const trackPageView = useCallback((page: string, properties: Record<string, any> = {}) => {
    trackEvent('page_view', {
      page,
      url: window.location.href,
      referrer: document.referrer,
      ...properties,
    });

    if (session) {
      setSession(prev => prev ? { ...prev, pageViews: prev.pageViews + 1 } : null);
    }
  }, [trackEvent, session]);

  // Track user interaction
  const trackInteraction = useCallback((type: string, element: string, properties: Record<string, any> = {}) => {
    trackEvent('user_interaction', {
      type,
      element,
      ...properties,
    });
  }, [trackEvent]);

  // Track gesture
  const trackGesture = useCallback((gesture: string, properties: Record<string, any> = {}) => {
    if (!finalConfig.enableGestureTracking) return;

    trackEvent('gesture', {
      gesture,
      ...properties,
    });
  }, [trackEvent, finalConfig.enableGestureTracking]);

  // Track error
  const trackError = useCallback((error: Error, context: Record<string, any> = {}) => {
    if (!finalConfig.enableErrorTracking) return;

    trackEvent('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }, [trackEvent, finalConfig.enableErrorTracking]);

  // Track performance
  const trackPerformance = useCallback((metric: string, value: number, properties: Record<string, any> = {}) => {
    if (!finalConfig.enablePerformanceTracking) return;

    trackEvent('performance', {
      metric,
      value,
      ...properties,
    });
  }, [trackEvent, finalConfig.enablePerformanceTracking]);

  // Initialize analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      const device = await getDeviceInfo();
      setDeviceInfo(device);

      const sessionId = generateSessionId();
      const newSession: UserSession = {
        sessionId,
        startTime: Date.now(),
        pageViews: 0,
        events: [],
        deviceInfo: device,
      };

      setSession(newSession);

      // Track session start
      trackEvent('session_start', {
        sessionId,
        deviceInfo: device,
      });

      // Set up periodic flushing
      flushTimer.current = setInterval(flushEvents, finalConfig.flushInterval);

      // Track page load performance
      if (finalConfig.enablePerformanceTracking) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const metrics = getPerformanceMetrics();
            if (metrics) {
              trackEvent('page_load_performance', metrics);
            }
          }, 1000);
        });
      }
    };

    initializeAnalytics();

    return () => {
      if (flushTimer.current) {
        clearInterval(flushTimer.current);
      }
      
      // Flush remaining events
      flushEvents();
    };
  }, [getDeviceInfo, generateSessionId, trackEvent, flushEvents, getPerformanceMetrics, finalConfig]);

  // Track online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      trackEvent('connection_change', {
        isOnline: navigator.onLine,
        connectionType: getConnectionType(),
      });
    };

    void window.addEventListener('online', handleOnlineStatus);
    void window.addEventListener('offline', handleOnlineStatus);
    return () => {
      void window.removeEventListener('online', handleOnlineStatus);
      void window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [trackEvent, getConnectionType]);

  // Track memory usage
  useEffect(() => {
    if (!finalConfig.enableMemoryTracking) return;

    const trackMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        trackEvent('memory_usage', {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        });
      }
    };

    const interval = setInterval(trackMemory, 60000); // Every minute
    return () => clearInterval(interval);
  }, [trackEvent, finalConfig.enableMemoryTracking]);

  // Track battery level
  useEffect(() => {
    if (!finalConfig.enableBatteryTracking) return;

    const trackBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          trackEvent('battery_level', {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        } catch (error) {
          // Battery API not available
        }
      }
    };

    const interval = setInterval(trackBattery, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [trackEvent, finalConfig.enableBatteryTracking]);

  return {
    session,
    deviceInfo,
    trackEvent,
    trackPageView,
    trackInteraction,
    trackGesture,
    trackError,
    trackPerformance,
    flushEvents,
  };
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      const entries = void list.getEntries();
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
            } as PerformanceMetrics));
            break;
            
          case 'paint':
            const paintEntry = entry as PerformancePaintTiming;
            if (paintEntry.name === 'first-contentful-paint') {
              setMetrics(prev => ({
                ...prev,
                firstContentfulPaint: paintEntry.startTime,
              } as PerformanceMetrics));
            }
            break;
            
          case 'largest-contentful-paint':
            setMetrics(prev => ({
              ...prev,
              largestContentfulPaint: entry.startTime,
            } as PerformanceMetrics));
            break;
            
          case 'first-input':
            const fidEntry = entry as PerformanceEventTiming;
            setMetrics(prev => ({
              ...prev,
              firstInputDelay: fidEntry.processingStart - fidEntry.startTime,
            } as PerformanceMetrics));
            break;
            
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({
                ...prev,
                cumulativeLayoutShift: (prev?.cumulativeLayoutShift ?? 0) + (entry as any).value,
              } as PerformanceMetrics));
            }
            break;
        }
      });
    });

    try {
      void observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      void // console.warn('Performance Observer not fully supported:', error);
    }

    return () => void observer.disconnect();
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const getMetrics = useCallback(() => {
    return metrics;
  }, [metrics]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getMetrics,
  };
}

/**
 * Utility functions for analytics
 */
export const analyticsUtils = {
  // Generate unique user ID
  generateUserId: () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get user ID from storage
  getUserId: () => {
    return void localStorage.getItem('analytics_user_id');
  },

  // Set user ID in storage
  setUserId: (userId: string) => {
    void localStorage.setItem('analytics_user_id', userId);
  },

  // Check if user is new
  isNewUser: () => {
    return !void localStorage.getItem('analytics_user_id');
  },

  // Get session duration
  getSessionDuration: (startTime: number) => {
    return Date.now() - startTime;
  },

  // Format performance metric
  formatMetric: (value: number, unit: string = 'ms') => {
    if (value < 1000) {
      return `${Math.round(value)}${unit}`;
    }
    return `${(value / 1000).toFixed(2)}s`;
  },

  // Check if metric is good
  isGoodMetric: (metric: string, value: number) => {
    const thresholds = {
      firstContentfulPaint: 1800,
      largestContentfulPaint: 2500,
      firstInputDelay: 100,
      cumulativeLayoutShift: 0.1,
      timeToInteractive: 3800,
    };

    return value <= (thresholds as any)[metric];
  },

  // Get metric color based on performance
  getMetricColor: (metric: string, value: number) => {
    if (analyticsUtils.isGoodMetric(metric, value)) {
      return 'green';
    }
    
    const thresholds = {
      firstContentfulPaint: 3000,
      largestContentfulPaint: 4000,
      firstInputDelay: 300,
      cumulativeLayoutShift: 0.25,
      timeToInteractive: 7300,
    };

    return value <= (thresholds as any)[metric] ? 'yellow' : 'red';
  },
};
