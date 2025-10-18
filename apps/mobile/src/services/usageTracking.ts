/**
 * Enhanced Analytics & Usage Tracking Service for PawfectMatch Mobile App
 * Comprehensive user behavior tracking, performance monitoring, and crash reporting
 */

import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Platform } from 'react-native';
import { api } from './api';

interface UsageStats {
  swipesUsed: number;
  swipesLimit: number;
  superLikesUsed: number;
  superLikesLimit: number;
  boostsUsed: number;
  boostsLimit: number;
  profileViews: number;
  messagesSent: number;
  matchRate: number;
}

interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  timestamp: number;
  sessionId: string;
  metadata: Record<string, any>;
  platform: 'ios' | 'android';
  appVersion: string;
  deviceInfo: {
    model: string;
    osVersion: string;
    screenSize: string;
  };
}

interface PerformanceMetrics {
  appLaunchTime: number;
  screenLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  batteryLevel: number;
}

interface CrashReport {
  error: string;
  stackTrace: string;
  userId: string | undefined;
  timestamp: number;
  deviceInfo: Record<string, any>;
  appState: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline = true;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
    this.initializeDeviceInfo();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track user behavior event
   */
  async trackEvent(
    eventType: string,
    metadata: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        eventType,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        metadata,
        platform: this.getPlatform(),
        appVersion: '1.0.0', // TODO: Get from app config
        deviceInfo: await this.getDeviceInfo(),
        ...(userId && { userId }),
      };

      this.eventQueue.push(event);

      // Flush if queue is full
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }

      if (__DEV__) {
        logger.debug('Analytics event tracked:', { eventType, metadata });
      }
    } catch (error) {
      logger.error('Failed to track analytics event:', { error, eventType });
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, userId?: string): Promise<void> {
    await this.trackEvent('screen_view', { screenName }, userId);
  }

  /**
   * Track user interaction
   */
  async trackInteraction(
    element: string,
    action: string,
    metadata: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    await this.trackEvent('user_interaction', {
      element,
      action,
      ...metadata,
    }, userId);
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: Partial<PerformanceMetrics>, userId?: string): Promise<void> {
    await this.trackEvent('performance_metric', metrics, userId);
  }

  /**
   * Track crash/error
   */
  async trackCrash(error: Error, context: Record<string, any> = {}, userId?: string): Promise<void> {
    const crashReport: CrashReport = {
      error: error.message,
      stackTrace: error.stack || '',
      userId: userId ?? undefined,
      timestamp: Date.now(),
      deviceInfo: await this.getDeviceInfo(),
      appState: context,
    };

    await this.trackEvent('app_crash', crashReport, userId);
    logger.error('App crash tracked:', crashReport);
  }

  /**
   * Track swipe action (enhanced version)
   */
  static async trackSwipe(
    userId: string,
    petId: string,
    action: 'like' | 'pass' | 'superlike',
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const analytics = AnalyticsService.getInstance();

      // Track the swipe event
      await analytics.trackEvent('swipe_action', {
        petId,
        action,
        ...metadata,
      }, userId);

      // Also track via API for server-side analytics
      const result = await api.request<{ success: boolean }>(`/usage/swipe`, {
        method: 'POST',
        body: JSON.stringify({ userId, petId, action }),
      });

      return result.success;
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to track swipe:', { error });
      }
      return false;
    }
  }

  /**
   * Track super like action (enhanced version)
   */
  static async trackSuperLike(
    userId: string,
    petId: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const analytics = AnalyticsService.getInstance();

      // Track the super like event
      await analytics.trackEvent('super_like', {
        petId,
        ...metadata,
      }, userId);

      // Also track via API
      const result = await api.request<{ success: boolean }>(`/usage/superlike`, {
        method: 'POST',
        body: JSON.stringify({ userId, petId }),
      });

      return result.success;
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to track super like:', { error });
      }
      return false;
    }
  }

  /**
   * Track boost action (enhanced version)
   */
  static async trackBoost(
    userId: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const analytics = AnalyticsService.getInstance();

      // Track the boost event
      await analytics.trackEvent('profile_boost', metadata, userId);

      // Also track via API
      const result = await api.request<{ success: boolean }>(`/usage/boost`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      return result.success;
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to track boost:', { error });
      }
      return false;
    }
  }

  /**
   * Get usage stats for user (enhanced)
   */
  static async getUsageStats(userId: string): Promise<UsageStats | null> {
    try {
      const result = await api.request<{ success: boolean; data?: UsageStats }>(`/usage/stats?userId=${encodeURIComponent(userId)}`);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to get usage stats:', { error });
      }
      return null;
    }
  }

  /**
   * Get analytics insights
   */
  async getAnalyticsInsights(userId: string): Promise<{
    dailyActiveUsers: number;
    sessionDuration: number;
    popularScreens: string[];
    conversionRate: number;
    crashRate: number;
  } | null> {
    try {
      const result = await api.request<{ success: boolean; data?: any }>(`/analytics/insights?userId=${encodeURIComponent(userId)}`);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to get analytics insights:', { error });
      return null;
    }
  }

  /**
   * Export user data for GDPR compliance
   */
  async exportUserData(userId: string): Promise<any> {
    try {
      const result = await api.request<{ success: boolean; data?: any }>(`/analytics/export?userId=${encodeURIComponent(userId)}`);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to export user data:', { error });
      return null;
    }
  }

  // Private methods

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToFlush = [...this.eventQueue];
      this.eventQueue = [];

      // Store locally first (for offline support)
      await this.storeEventsLocally(eventsToFlush);

      // Send to server if online
      if (this.isOnline) {
        await this.sendEventsToServer(eventsToFlush);
      }
    } catch (error) {
      logger.error('Failed to flush analytics events:', { error });
      // Re-queue events for retry
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  private async storeEventsLocally(events: AnalyticsEvent[]): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@analytics_queue') || '[]';
      const existingEvents: AnalyticsEvent[] = JSON.parse(stored);
      const combinedEvents = [...existingEvents, ...events];
      await AsyncStorage.setItem('@analytics_queue', JSON.stringify(combinedEvents));
    } catch (error) {
      logger.error('Failed to store events locally:', { error });
    }
  }

  private async sendEventsToServer(events: AnalyticsEvent[]): Promise<void> {
    try {
      await api.request('/analytics/events', {
        method: 'POST',
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      logger.error('Failed to send events to server:', { error });
      throw error;
    }
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPlatform(): 'ios' | 'android' {
    return Platform.OS === 'ios' ? 'ios' : 'android';
  }

  private async getDeviceInfo(): Promise<AnalyticsEvent['deviceInfo']> {
    // This would use react-native-device-info or similar
    return {
      model: 'Unknown Device',
      osVersion: Platform.Version?.toString() || 'Unknown',
      screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
    };
  }

  private async initializeDeviceInfo(): Promise<void> {
    // Additional device info initialization if needed
  }
}

// Export enhanced service
export const analyticsService = AnalyticsService.getInstance();
// Back-compat named export alias if needed
export { AnalyticsService as UsageTrackingService };
export default analyticsService;
