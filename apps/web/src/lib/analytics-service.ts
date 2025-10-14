/**
 * Analytics Service - Production Implementation
 * Integrates with Google Analytics, Mixpanel, or custom analytics backend
 */

import { logger } from '../services/logger';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalMessages: number;
  conversionRate: number;
}

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  plan?: string;
  createdAt?: string;
}

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000/api';

/**
 * Analytics Service
 * Tracks user events and provides analytics data
 */
export class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Google Analytics if available
      if (
        typeof window !== 'undefined' &&
        (window as unknown as Record<string, unknown>)['gtag']
      ) {
        logger.info('Google Analytics detected');
      }

      // Initialize Mixpanel if available
      if (
        typeof window !== 'undefined' &&
        (window as unknown as Record<string, unknown>)['mixpanel']
      ) {
        logger.info('Mixpanel detected');
      }

      this.isInitialized = true;
      logger.info('Analytics service initialized', { sessionId: this.sessionId });
    } catch (error) {
      logger.error('Failed to initialize analytics service', { error });
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Set the current user
   */
  setUser(user: AnalyticsUser): void {
    this.userId = user.id;

    // Set user in Google Analytics
    if (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['gtag']
    ) {
      const gtag = (window as unknown as Record<string, unknown>)['gtag'] as (
        ...args: unknown[]
      ) => void;
      gtag('set', 'user_properties', {
        user_id: user.id,
        plan: user.plan,
      });
    }

    // Set user in Mixpanel
    if (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['mixpanel']
    ) {
      interface MixpanelAPI {
        identify: (id: string) => void;
        people: {
          set: (properties: Record<string, unknown>) => void;
        };
        track: (eventName: string, properties: Record<string, unknown>) => void;
      }
      const mixpanel = (window as unknown as Record<string, unknown>)['mixpanel'] as unknown as MixpanelAPI;
      mixpanel.identify(user.id);
      mixpanel.people.set({
        $email: user.email,
        $name: user.name,
        plan: user.plan,
        $created: user.createdAt,
      });
    }

    logger.info('Analytics user set', { userId: user.id });
  }

  /**
   * Clear the current user
   */
  clearUser(): void {
    this.userId = null;

    // Reset in Mixpanel
    if (typeof window !== 'undefined') {
      // Define window with mixpanel property for TypeScript
      const windowWithMixpanel = window as Window & {
        mixpanel?: {
          reset: () => void;
        };
      };

      if (windowWithMixpanel.mixpanel) {
        windowWithMixpanel.mixpanel.reset();
      }
    }

    logger.info('Analytics user cleared');
  }

  /**
   * Track an analytics event
   */
  async track(event: AnalyticsEvent): Promise<void> {
    const userId = event.userId ?? this.userId ?? null;
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      sessionId: this.sessionId,
      ...(userId ? { userId } : {}),
    };

    try {
      // Track in Google Analytics
      if (
        typeof window !== 'undefined' &&
        (window as unknown as Record<string, unknown>)['gtag']
      ) {
        const gtag = (window as unknown as Record<string, unknown>)['gtag'] as (
          ...args: unknown[]
        ) => void;
        gtag('event', event.name, event.properties ?? {});
      }

      // Track in Mixpanel
      if (
        typeof window !== 'undefined' &&
        (window as unknown as Record<string, unknown>)['mixpanel']
      ) {
        interface MixpanelAPI {
          track: (eventName: string, properties: Record<string, unknown>) => void;
        }
        const mixpanel = (window as unknown as Record<string, unknown>)['mixpanel'] as unknown as MixpanelAPI;
        mixpanel.track(event.name, event.properties ?? {});
      }

      // Send to backend analytics
      await this.sendToBackend(enrichedEvent);

      logger.info('Analytics event tracked', { event: event.name });
    } catch (error) {
      logger.error('Failed to track analytics event', { error, event: event.name });
    }
  }

  /**
   * Send event to backend analytics API
   */
  private async sendToBackend(event: AnalyticsEvent): Promise<void> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      await fetch(`${API_BASE_URL}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Fail silently for analytics
      logger.warn('Failed to send analytics to backend', { error });
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    this.track({
      name: 'page_view',
      properties: {
        path,
        title: title || document.title,
        referrer: document.referrer,
      },
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, properties?: Record<string, unknown>): void {
    const event: AnalyticsEvent = properties ? { name: action, properties } : { name: action };
    this.track(event);
  }

  /**
   * Get analytics metrics from backend
   */
  async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const response = await fetch(`${API_BASE_URL}/analytics/metrics`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      logger.error('Failed to fetch analytics metrics', { error });
    }

    // Return default metrics if API fails
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalMatches: 0,
      totalMessages: 0,
      conversionRate: 0,
    };
  }

  /**
   * Get user events from backend
   */
  async getEvents(filters?: { userId?: string; eventName?: string }): Promise<AnalyticsEvent[]> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const params = new URLSearchParams();

      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.eventName) params.append('eventName', filters.eventName);

      const response = await fetch(`${API_BASE_URL}/analytics/events?${params.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data.events || [];
      }
    } catch (error) {
      logger.error('Failed to fetch analytics events', { error });
    }

    return [];
  }

  /**
   * Track conversion event
   */
  trackConversion(type: string, value?: number, currency?: string): void {
    this.track({
      name: 'conversion',
      properties: {
        type,
        value,
        currency: currency || 'USD',
      },
    });

    // Track in Google Analytics as conversion
    if (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['gtag']
    ) {
      const gtag = (window as unknown as Record<string, unknown>)['gtag'] as (
        ...args: unknown[]
      ) => void;
      gtag('event', 'conversion', {
        send_to: process.env['NEXT_PUBLIC_GA_CONVERSION_ID'],
        value,
        currency: currency || 'USD',
        transaction_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      });
    }
  }

  /**
   * Track error event
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
