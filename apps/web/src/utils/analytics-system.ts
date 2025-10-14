/**
 * 📊 ADVANCED ANALYTICS SYSTEM
 * Comprehensive user behavior tracking and performance monitoring
 */

'use client';

import { logger } from '../services/logger';

/**
 * Secure token retrieval for analytics
 * This should be replaced with proper token management from your auth system
 */
async function getSecureAuthToken(): Promise<string | null> {
  // TODO: Replace with secure token retrieval from auth context/store
  // For now, use a more secure approach than direct localStorage access
  try {
    // Check if we have a token in memory first (from auth context)
    // This is a placeholder - should be replaced with proper auth integration
    if (typeof window !== 'undefined') {
      // Try to get from sessionStorage first (more secure than localStorage)
      const sessionToken = sessionStorage.getItem('auth_token');
      if (sessionToken) {
        return sessionToken;
      }

      // Fallback to localStorage only if necessary (less secure)
      const localToken = localStorage.getItem('auth_token');
      if (localToken) {
        // Move to sessionStorage for better security
        sessionStorage.setItem('auth_token', localToken);
        localStorage.removeItem('auth_token');
        return localToken;
      }
    }
  } catch (error) {
    logger.warn('Failed to retrieve auth token securely', { error });
  }

  return null;
}

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface UserBehavior {
  swipes: { direction: 'like' | 'pass' | 'superlike'; petId: string; timestamp: number }[];
  messages: { matchId: string; timestamp: number }[];
  pageViews: { page: string; duration: number; timestamp: number }[];
  interactions: { element: string; action: string; timestamp: number }[];
}

interface PerformanceMetrics {
  pageLoad: number[];
  apiCalls: { endpoint: string; duration: number; status: number; timestamp: number }[];
  errors: { message: string; stack?: string; timestamp: number }[];
  memoryUsage: number[];
}

export class AdvancedAnalytics {
  private userId: string | null = null;
  private sessionId: string;
  private pageStartTime: number;
  private isOnline: boolean;
  private queue: AnalyticsEvent[] = [];
  private performanceInterval: NodeJS.Timeout | null = null;
  private userBehavior: UserBehavior = {
    swipes: [],
    messages: [],
    pageViews: [],
    interactions: [],
  };
  private performanceMetrics: PerformanceMetrics = {
    pageLoad: [],
    apiCalls: [],
    errors: [],
    memoryUsage: [],
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.pageStartTime = Date.now();
    this.isOnline = true;
    this.initializeTracking();
    this.startPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageView(window.location.pathname, Date.now() - this.pageStartTime);
      } else {
        this.pageStartTime = Date.now();
      }
    });

    // Track network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason));
    });
  }

  private startPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor memory usage with proper cleanup tracking
    this.performanceInterval = setInterval(() => {
      // Feature detection for Chrome performance.memory API
      try {
        const perfMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
        if (perfMemory?.usedJSHeapSize !== undefined && typeof perfMemory.usedJSHeapSize === 'number') {
          this.performanceMetrics.memoryUsage.push(perfMemory.usedJSHeapSize);

          // Keep only last 20 measurements
          if (this.performanceMetrics.memoryUsage.length > 20) {
            this.performanceMetrics.memoryUsage.shift();
          }
        }
      } catch {
        // Memory API not supported or access denied
      }
    }, 10000); // Every 10 seconds
  }

  destroy() {
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
      this.performanceInterval = null;
    }
  }

  // ====== PUBLIC METHODS ======

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Track user interactions
  trackSwipe(direction: 'like' | 'pass' | 'superlike', petId: string) {
    this.userBehavior.swipes.push({
      direction,
      petId,
      timestamp: Date.now(),
    });

    this.track('pet_swipe', {
      direction,
      petId,
      sessionSwipes: this.userBehavior.swipes.length,
    });
  }

  trackMessage(matchId: string, messageLength: number) {
    this.userBehavior.messages.push({
      matchId,
      timestamp: Date.now(),
    });

    this.track('message_sent', {
      matchId,
      messageLength,
      sessionMessages: this.userBehavior.messages.length,
    });
  }

  trackPageView(page: string, duration?: number) {
    const finalDuration = duration || Date.now() - this.pageStartTime;

    this.userBehavior.pageViews.push({
      page,
      duration: finalDuration,
      timestamp: Date.now(),
    });

    this.track('page_view', {
      page,
      duration: finalDuration,
      sessionPageViews: this.userBehavior.pageViews.length,
    });
  }

  trackInteraction(element: string, action: string, metadata?: Record<string, unknown>) {
    this.userBehavior.interactions.push({
      element,
      action,
      timestamp: Date.now(),
    });

    this.track('user_interaction', {
      element,
      action,
      ...metadata,
      sessionInteractions: this.userBehavior.interactions.length,
    });
  }

  trackAIUsage(
    feature: string,
    success: boolean,
    duration?: number,
    metadata?: Record<string, unknown>,
  ) {
    this.track('ai_feature_used', {
      feature,
      success,
      duration,
      ...metadata,
    });
  }

  trackPremiumFeatureAttempt(feature: string, hasAccess: boolean) {
    this.track('premium_feature_attempt', {
      feature,
      hasAccess,
      conversionOpportunity: !hasAccess,
    });
  }

  trackMatchSuccess(matchId: string, compatibilityScore?: number) {
    this.track('match_created', {
      matchId,
      compatibilityScore,
      sessionMatches: this.userBehavior.swipes.filter((s) => s.direction === 'like').length,
    });
  }

  // Track performance metrics
  trackApiCall(endpoint: string, duration: number, status: number) {
    this.performanceMetrics.apiCalls.push({
      endpoint,
      duration,
      status,
      timestamp: Date.now(),
    });

    // Keep only last 50 API calls
    if (this.performanceMetrics.apiCalls.length > 50) {
      this.performanceMetrics.apiCalls.shift();
    }

    // Track slow API calls
    if (duration > 2000) {
      this.track('slow_api_call', {
        endpoint,
        duration,
        status,
      });
    }
  }

  trackError(error: Error, context?: Record<string, unknown>) {
    const errorEntry: { message: string; stack?: string; timestamp: number } = {
      message: error.message,
      timestamp: Date.now(),
    };
    if (error.stack) {
      errorEntry.stack = error.stack;
    }
    this.performanceMetrics.errors.push(errorEntry);

    this.track('error_occurred', {
      message: error.message,
      stack: error.stack?.substring(0, 500), // Limit stack trace length
      context,
      sessionErrors: this.performanceMetrics.errors.length,
    });
  }

  // ====== CORE TRACKING METHOD ======
  private track(eventName: string, properties?: Record<string, unknown>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        screenResolution:
          typeof window !== 'undefined'
            ? `${window.screen.width}x${window.screen.height}`
            : undefined,
        connectionType: this.getConnectionType(),
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    // Only add userId if it exists (for exactOptionalPropertyTypes)
    if (this.userId) {
      event.userId = this.userId;
    }

    if (this.isOnline) {
      this.sendEvent(event);
    } else {
      this.queue.push(event);
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // Map client event to server analytics batch schema
      const props = (event.properties ?? {}) as Record<string, unknown>;
      const mapped = {
        userId: event.userId,
        eventType: event.name,
        entityType: props['entityType'] as string | undefined,
        entityId: props['entityId'] as string | undefined,
        durationMs: props['duration'] as number | undefined,
        success: props['success'] as boolean | undefined,
        errorCode: props['errorCode'] as string | undefined,
        metadata: props,
        createdAt: event.timestamp ? new Date(event.timestamp).toISOString() : new Date().toISOString(),
      } as Record<string, unknown>;

      // Use a secure token retrieval method instead of direct localStorage access
      const authToken = await getSecureAuthToken();
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ events: [mapped] }),
      });
    } catch (error) {
      logger.warn('Failed to send analytics event', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      this.queue.push(event);
    }
  }

  private flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  private getConnectionType(): string {
    // Feature detection for Network Information API
    try {
      const navConnection = (navigator as { connection?: { effectiveType?: string } }).connection;
      if (navConnection?.effectiveType) {
        return navConnection.effectiveType;
      }
    } catch {
      // Network API not supported
    }
    return 'unknown';
  }

  // ====== REPORTING METHODS ======
  generateUserBehaviorReport() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    const recentSwipes = this.userBehavior.swipes.filter((s) => s.timestamp > last24h);
    const recentMessages = this.userBehavior.messages.filter((m) => m.timestamp > last24h);
    const recentPageViews = this.userBehavior.pageViews.filter((p) => p.timestamp > last24h);

    return {
      session: {
        id: this.sessionId,
        duration: now - this.pageStartTime,
        userId: this.userId,
      },
      last24Hours: {
        swipes: {
          total: recentSwipes.length,
          likes: recentSwipes.filter((s) => s.direction === 'like').length,
          passes: recentSwipes.filter((s) => s.direction === 'pass').length,
          superLikes: recentSwipes.filter((s) => s.direction === 'superlike').length,
        },
        messages: recentMessages.length,
        pageViews: recentPageViews.length,
        averageSessionTime:
          recentPageViews.reduce((sum, pv) => sum + pv.duration, 0) / recentPageViews.length || 0,
      },
      engagement: {
        swipeRate: recentSwipes.length / Math.max(recentPageViews.length, 1),
        messageRate: recentMessages.length / Math.max(recentPageViews.length, 1),
        retentionScore: this.calculateRetentionScore(),
      },
    };
  }

  generatePerformanceReport() {
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      metrics: {
        averageApiResponseTime: this.calculateAverageApiTime(),
        errorRate: this.calculateErrorRate(),
        memoryTrend: this.calculateMemoryTrend(),
        slowRequests: this.performanceMetrics.apiCalls.filter((call) => call.duration > 2000)
          .length,
      },
      recommendations: this.generatePerformanceRecommendations(),
    };
  }

  private calculateRetentionScore(): number {
    const totalInteractions = this.userBehavior.interactions.length;
    const sessionDuration = Date.now() - this.pageStartTime;
    const engagementRate = totalInteractions / (sessionDuration / 60000); // Interactions per minute

    return Math.min(100, engagementRate * 10);
  }

  private calculateAverageApiTime(): number {
    const calls = this.performanceMetrics.apiCalls;
    if (calls.length === 0) return 0;

    return calls.reduce((sum, call) => sum + call.duration, 0) / calls.length;
  }

  private calculateErrorRate(): number {
    const totalApiCalls = this.performanceMetrics.apiCalls.length;
    const errorCalls = this.performanceMetrics.apiCalls.filter((call) => call.status >= 400).length;

    if (totalApiCalls === 0) return 0;
    return (errorCalls / totalApiCalls) * 100;
  }

  private calculateMemoryTrend(): 'increasing' | 'stable' | 'decreasing' {
    const recent = this.performanceMetrics.memoryUsage.slice(-5);
    if (recent.length < 3) return 'stable';

    const first = recent[0];
    const last = recent[recent.length - 1];

    if (first === undefined || last === undefined) return 'stable';

    const trend = last - first;
    if (trend > first * 0.1) return 'increasing';
    if (trend < -first * 0.1) return 'decreasing';
    return 'stable';
  }

  private generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.calculateAverageApiTime() > 1000) {
      recommendations.push('API response times are slow - consider caching optimization');
    }

    if (this.calculateErrorRate() > 5) {
      recommendations.push('High error rate detected - review error handling');
    }

    if (this.calculateMemoryTrend() === 'increasing') {
      recommendations.push('Memory usage is increasing - check for memory leaks');
    }

    return recommendations;
  }
}

// ====== SINGLETON INSTANCE ======
let analyticsInstance: AdvancedAnalytics | null = null;

export const getAnalytics = (): AdvancedAnalytics => {
  if (!analyticsInstance) {
    analyticsInstance = new AdvancedAnalytics();
  }
  return analyticsInstance;
};

// ====== REACT HOOK ======
export const useAnalytics = () => {
  const analytics = getAnalytics();

  const trackSwipe = (direction: 'like' | 'pass' | 'superlike', petId: string): void => {
    analytics.trackSwipe(direction, petId);
  };

  const trackMessage = (matchId: string, messageLength: number): void => {
    analytics.trackMessage(matchId, messageLength);
  };

  const trackInteraction = (element: string, action: string, metadata?: Record<string, unknown>): void => {
    analytics.trackInteraction(element, action, metadata);
  };

  const trackAIUsage = (feature: string, success: boolean, duration: number, metadata?: Record<string, unknown>): void => {
    analytics.trackAIUsage(feature, success, duration, metadata);
  };

  const trackPremiumFeatureAttempt = (feature: string, hasAccess: boolean): void => {
    analytics.trackPremiumFeatureAttempt(feature, hasAccess);
  };

  const trackMatchSuccess = (matchId: string, compatibilityScore: number): void => {
    analytics.trackMatchSuccess(matchId, compatibilityScore);
  };

  const trackApiCall = (endpoint: string, duration: number, status: number): void => {
    analytics.trackApiCall(endpoint, duration, status);
  };

  const generateReport = (): object => ({
    behavior: analytics.generateUserBehaviorReport(),
    performance: analytics.generatePerformanceReport(),
  });

  return {
    trackSwipe,
    trackMessage,
    trackInteraction,
    trackAIUsage,
    trackPremiumFeatureAttempt,
    trackMatchSuccess,
    trackApiCall,
    generateReport,
    setUserId: (userId: string) => analytics.setUserId(userId),
  };
};

// ====== HOC FOR AUTOMATIC TRACKING ======
// Temporarily disabled due to Next.js compilation issues with JSX in utility files
// TODO: Move to a separate HOC file or refactor
/* 
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = (): JSX.Element => {
    const analytics = useAnalytics();

    React.useEffect(() => {
      analytics.trackInteraction(componentName, 'component_mounted');
      
      return () => {
        analytics.trackInteraction(componentName, 'component_unmounted');
      };
    }, [analytics]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAnalytics(${componentName})`;
  return WrappedComponent;
}
*/

// ====== PERFORMANCE TRACKING UTILITIES ======
export const _trackAPIPerformance = () => {
  const originalFetch = window.fetch;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const start = Date.now();
    const endpoint = typeof input === 'string' ? input : input.toString();
    const analytics = getAnalytics();

    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - start;

      analytics.trackApiCall(endpoint, duration, response.status);

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      analytics.trackApiCall(endpoint, duration, 0); // 0 indicates network error
      analytics.trackError(error as Error, { endpoint, duration });
      throw error;
    }
  };
};

// ====== EXPORTS ======
export default getAnalytics;
