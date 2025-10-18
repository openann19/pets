'use client';

// ====== PERFORMANCE MONITORING SYSTEM ======

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export interface CoreWebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  INP: number; // Interaction to Next Paint
}

export interface PerformanceConfig {
  enableCoreWebVitals: boolean;
  enableResourceTiming: boolean;
  enableUserTiming: boolean;
  enableMemoryMonitoring: boolean;
  enableNetworkMonitoring: boolean;
  enableErrorTracking: boolean;
  sampleRate: number; // 0-1, percentage of users to monitor
  endpoint: string;
  batchSize: number;
  flushInterval: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableCoreWebVitals: true,
  enableResourceTiming: true,
  enableUserTiming: true,
  enableMemoryMonitoring: true,
  enableNetworkMonitoring: true,
  enableErrorTracking: true,
  sampleRate: 0.1, // Monitor 10% of users
  endpoint: '/api/performance',
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
};

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private observers: PerformanceObserver[] = [];

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isEnabled = Math.random() < this.config.sampleRate;
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Initialize observers
    if (this.config.enableCoreWebVitals) {
      this.initializeCoreWebVitals();
    }

    if (this.config.enableResourceTiming) {
      this.initializeResourceTiming();
    }

    if (this.config.enableUserTiming) {
      this.initializeUserTiming();
    }

    if (this.config.enableErrorTracking) {
      this.initializeErrorTracking();
    }

    // Start flush timer
    this.startFlushTimer();

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  private initializeCoreWebVitals(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.addMetric('FCP', fcpEntry.startTime);
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported:', e);
      }
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.addMetric('LCP', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported:', e);
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              this.addMetric('FID', fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported:', e);
      }
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.addMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported:', e);
      }
    }

    // Time to First Byte
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.requestStart;
      this.addMetric('TTFB', ttfb);
    }
  }

  private initializeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.addMetric(`RESOURCE_${resourceEntry.name}`, resourceEntry.duration);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing observer not supported:', e);
      }
    }
  }

  private initializeUserTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const userTimingObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure') {
              this.addMetric(`USER_${entry.name}`, entry.duration);
            }
          });
        });
        userTimingObserver.observe({ entryTypes: ['measure'] });
        this.observers.push(userTimingObserver);
      } catch (e) {
        console.warn('User timing observer not supported:', e);
      }
    }
  }

  private initializeErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.addMetric('JS_ERROR', 1, {
        error: event.error?.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addMetric('PROMISE_REJECTION', 1, {
        reason: event.reason?.message || event.reason,
      });
    });
  }

  private addMetric(name: string, value: number, metadata?: any): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata,
    };

    // Add connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        metric.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        };
      }
    }

    // Add memory info if available
    if (this.config.enableMemoryMonitoring && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        metric.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
    }

    this.metrics.push(metric);

    // Flush if batch size reached
    if (this.metrics.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          timestamp: Date.now(),
          sessionId: this.getSessionId(),
        }),
      });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
      // Re-add metrics to queue for retry
      this.metrics.unshift(...metricsToSend);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance-session-id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('performance-session-id', sessionId);
    }
    return sessionId;
  }

  // Public API
  public mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  public measure(name: string, startMark?: string, endMark?: string): void {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
        console.warn('Performance measure failed:', e);
      }
    }
  }

  public getCoreWebVitals(): CoreWebVitals | null {
    if (!this.isEnabled) return null;

    const vitals: Partial<CoreWebVitals> = {};
    
    // Get latest values from metrics
    this.metrics.forEach(metric => {
      if (metric.name in vitals) {
        (vitals as any)[metric.name] = metric.value;
      }
    });

    // Check if all vitals are present
    const requiredVitals = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'];
    const hasAllVitals = requiredVitals.every(vital => vital in vitals);

    return hasAllVitals ? vitals as CoreWebVitals : null;
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public destroy(): void {
    // Clear observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Clear timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining metrics
    this.flush();
  }
}

// ====== SINGLETON INSTANCE ======

let performanceMonitor: PerformanceMonitor | null = null;

export const initializePerformanceMonitoring = (config?: Partial<PerformanceConfig>): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(config);
  }
  return performanceMonitor;
};

export const getPerformanceMonitor = (): PerformanceMonitor | null => {
  return performanceMonitor;
};

// ====== CONVENIENCE FUNCTIONS ======

export const mark = (name: string): void => {
  performanceMonitor?.mark(name);
};

export const measure = (name: string, startMark?: string, endMark?: string): void => {
  performanceMonitor?.measure(name, startMark, endMark);
};

export const getCoreWebVitals = (): CoreWebVitals | null => {
  return performanceMonitor?.getCoreWebVitals() || null;
};

export const getMetrics = (): PerformanceMetric[] => {
  return performanceMonitor?.getMetrics() || [];
};

// ====== REACT HOOKS ======

import { useEffect, useState } from 'react';

export const usePerformanceMonitoring = (config?: Partial<PerformanceConfig>) => {
  const [monitor, setMonitor] = useState<PerformanceMonitor | null>(null);
  const [coreWebVitals, setCoreWebVitals] = useState<CoreWebVitals | null>(null);

  useEffect(() => {
    const perfMonitor = initializePerformanceMonitoring(config);
    setMonitor(perfMonitor);

    // Update Core Web Vitals periodically
    const interval = setInterval(() => {
      const vitals = perfMonitor.getCoreWebVitals();
      if (vitals) {
        setCoreWebVitals(vitals);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      perfMonitor.destroy();
    };
  }, [config]);

  return {
    monitor,
    coreWebVitals,
    mark: (name: string) => monitor?.mark(name),
    measure: (name: string, startMark?: string, endMark?: string) => 
      monitor?.measure(name, startMark, endMark),
  };
};

export const useCoreWebVitals = () => {
  const [vitals, setVitals] = useState<CoreWebVitals | null>(null);

  useEffect(() => {
    const updateVitals = () => {
      const currentVitals = getCoreWebVitals();
      if (currentVitals) {
        setVitals(currentVitals);
      }
    };

    // Update immediately
    updateVitals();

    // Update periodically
    const interval = setInterval(updateVitals, 10000);

    return () => clearInterval(interval);
  }, []);

  return vitals;
};

// ====== PERFORMANCE UTILITIES ======

export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  mark(startMark);
  try {
    const result = await fn();
    mark(endMark);
    measure(name, startMark, endMark);
    return result;
  } catch (error) {
    mark(endMark);
    measure(name, startMark, endMark);
    throw error;
  }
};

export const measureSync = <T>(name: string, fn: () => T): T => {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  mark(startMark);
  try {
    const result = fn();
    mark(endMark);
    measure(name, startMark, endMark);
    return result;
  } catch (error) {
    mark(endMark);
    measure(name, startMark, endMark);
    throw error;
  }
};

// ====== EXPORT DEFAULT ======

export default PerformanceMonitor;
