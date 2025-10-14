/**
 * Advanced Notification Service
 * Comprehensive push notification management with smart features, background sync, and rich notifications
 */

import { logger } from '@pawfectmatch/core';

export interface NotificationData {
  id?: string;
  type: 'match' | 'message' | 'like' | 'reminder' | 'promotion' | 'custom';
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
  scheduledFor?: number;
  expiresAt?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    match: boolean;
    message: boolean;
    like: boolean;
    reminder: boolean;
    promotion: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  frequency: 'immediate' | 'batched' | 'digest';
  sound: boolean;
  vibration: boolean;
}

export interface NotificationAnalytics {
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  failed: number;
  byType: Record<string, number>;
}

class AdvancedNotificationService {
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private preferences: NotificationPreferences;
  private analytics: NotificationAnalytics;
  private messageQueue: NotificationData[] = [];
  private scheduledNotifications: Map<string, NotificationData> = new Map();
  private isOnline: boolean = true;

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.analytics = this.getDefaultAnalytics();
    this.init();
    this.setupEventListeners();
  }

  private async init(): Promise<void> {
    await this.registerServiceWorker();
    await this.loadPreferences();
    await this.loadAnalytics();
    this.isOnline = navigator.onLine;
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) {
        logger.warn('Service workers are not supported');
        return;
      }

      if (!('PushManager' in window)) {
        logger.warn('Push notifications are not supported');
        return;
      }

      this.serviceWorker = await navigator.serviceWorker.ready;
      this.setupServiceWorkerListeners();
    } catch (error) {
      logger.error(`Service worker registration failed: ${error}`);
    }
  }

  private setupServiceWorkerListeners(): void {
    if (this.serviceWorker && this.serviceWorker.active) {
      navigator.serviceWorker.addEventListener(
        'message',
        this.handleServiceWorkerMessage.bind(this),
      );
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        logger.info('Notification permission granted');
        return true;
      }
      logger.warn('Notification permission denied');
      return false;
    } catch (error) {
      logger.error(`Failed to request permission: ${error}`);
      return false;
    }
  }

  /**
   * Check if notifications are supported and permitted
   */
  async isSupported(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }

    const permission = await this.requestPermission();
    return permission;
  }

  /**
   * Send a notification
   */
  async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      if (!this.shouldSendNotification(notification)) {
        logger.info('Notification skipped due to user preferences');
        return false;
      }

      if (this.isQuietHours()) {
        const delay = this.getNextAvailableTime();
        await this.scheduleNotification(notification, delay);
        logger.info('Notification scheduled for after quiet hours');
        return true;
      }

      if (!this.isOnline) {
        this.messageQueue.push(notification);
        logger.info('User is offline, notification queued');
        return true;
      }

      if (this.serviceWorker && this.serviceWorker.active) {
        await this.serviceWorker.active.postMessage({
          type: 'show-notification',
          notification,
        });
      } else {
        this.showBasicNotification(notification);
      }

      // Update analytics
      this.updateAnalytics('sent', notification.type);

      return true;
    } catch (error) {
      logger.error(`Failed to send notification: ${error}`);
      this.updateAnalytics('failed', notification.type);
      return false;
    }
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(notification: NotificationData, delay: number): Promise<string> {
    try {
      const id = notification.id || `scheduled-${Date.now()}`;
      notification.id = id;
      notification.scheduledFor = Date.now() + delay;

      this.scheduledNotifications.set(id, notification);

      // Send to service worker
      if (this.serviceWorker && this.serviceWorker.active) {
        await this.serviceWorker.active.postMessage({
          type: 'schedule-notification',
          notification: {
            ...notification,
            delay,
          },
        });
      }

      return id;
    } catch (error) {
      logger.error(`Failed to schedule notification: ${error}`);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(id: string): Promise<boolean> {
    try {
      this.scheduledNotifications.delete(id);

      if (this.serviceWorker && this.serviceWorker.active) {
        await this.serviceWorker.active.postMessage({
          type: 'cancel-notification',
          id,
        });
      }

      return true;
    } catch (error) {
      logger.error(`Failed to cancel notification: ${error}`);
      return false;
    }
  }

  /**
   * Send smart notification based on user behavior
   */
  async sendSmartNotification(type: string, data: unknown): Promise<boolean> {
    try {
      const notification = await this.generateSmartNotification(type, data);
      return this.sendNotification(notification);
    } catch (error) {
      logger.error(`Failed to send smart notification: ${error}`);
      return false;
    }
  }

  /**
   * Send batch of notifications
   */
  async sendBatchNotifications(notifications: NotificationData[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      notifications.map((notification) => this.sendNotification(notification)),
    );

    return results.map((result) => (result.status === 'fulfilled' ? result.value : false));
  }

  /**
   * Send digest notification
   */
  async sendDigestNotification(notifications: NotificationData[]): Promise<boolean> {
    try {
      if (notifications.length === 0) return false;

      const digest = this.createDigestNotification(notifications);
      return this.sendNotification(digest);
    } catch (error) {
      logger.error(`Failed to send digest notification: ${error}`);
      return false;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Get notification analytics
   */
  getAnalytics(): NotificationAnalytics {
    return { ...this.analytics };
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        await this.serviceWorker.active.postMessage({
          type: 'clear-all-notifications',
        });
      }
    } catch (error) {
      logger.error(`Failed to clear notifications: ${error}`);
    }
  }

  /**
   * Get stored notifications
   */
  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.notifications || []);
        };

        if (this.serviceWorker && this.serviceWorker.active) {
          this.serviceWorker.active.postMessage({ type: 'get-notifications' }, [
            messageChannel.port2,
          ]);
        } else {
          resolve([]);
        }
      });
    } catch (error) {
      logger.error(`Failed to get stored notifications: ${error}`);
      return [];
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processMessageQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Visibility change events
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.processMessageQueue();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.savePreferences();
      this.saveAnalytics();
    });
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;

    switch (data.type) {
      case 'notification-clicked':
        this.handleNotificationClick(data.notification);
        break;
      case 'notification-action':
        this.handleNotificationAction(data.action, data.notification);
        break;
      case 'notification-dismissed':
        this.updateAnalytics('dismissed', data.notification.type);
        break;
      default:
        logger.warn(`Unknown service worker message: ${data.type}`);
    }
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(notification: NotificationData): void {
    this.updateAnalytics('clicked', notification.type);

    if (notification.url) {
      window.open(notification.url, '_blank');
    }
  }

  /**
   * Handle notification action
   */
  private handleNotificationAction(action: string, notification: NotificationData): void {
    logger.info(`Notification action: ${action}`, { notification });

    // Handle specific actions
    switch (action) {
      case 'reply':
        // Open reply interface
        break;
      case 'like_back':
        // Like back functionality
        break;
      case 'snooze':
        // Snooze notification
        break;
      default:
        logger.warn(`Unknown action: ${action}`);
    }
  }

  /**
   * Check if notification should be sent based on preferences
   */
  private shouldSendNotification(notification: NotificationData): boolean {
    if (!this.preferences.enabled) return false;

    const typeEnabled =
      this.preferences.types[notification.type as keyof typeof this.preferences.types];
    if (!typeEnabled) return false;

    return true;
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const startTime = this.parseTime(this.preferences.quietHours.start);
    const endTime = this.parseTime(this.preferences.quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Parse time string to minutes
   */
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours ?? 0) * 60 + (minutes ?? 0);
  }

  /**
   * Get next available time outside quiet hours
   */
  private getNextAvailableTime(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow

    return tomorrow.getTime() - now.getTime();
  }

  /**
   * Generate smart notification based on type and data
   */
  private async generateSmartNotification(type: string, data: unknown): Promise<NotificationData> {
    const typedData = data as Record<string, unknown>;
    // Implementation would use AI/ML to generate personalized notifications
    switch (type) {
      case 'match':
        return {
          type: 'match',
          title: 'New Match! 🐾',
          body: `You and ${typedData['petName'] as string} are a perfect match!`,
          image: typedData['petImage'] as string,
          url: `/matches/${typedData['matchId'] as string}`,
          data: { matchId: typedData['matchId'] as string },
          actions: [
            { action: 'view', title: 'View Match' },
            { action: 'chat', title: 'Start Chat' },
          ],
          requireInteraction: true,
          vibrate: [200, 100, 200],
        };

      case 'message':
        return {
          type: 'message',
          title: `Message from ${typedData['senderName'] as string}`,
          body: typedData['message'] as string,
          image: typedData['senderAvatar'] as string,
          url: `/chat/${typedData['chatId'] as string}`,
          data: { chatId: typedData['chatId'] as string },
          actions: [
            { action: 'reply', title: 'Reply' },
            { action: 'view', title: 'View Chat' },
          ],
        };

      default: {
        const url = typedData['url'] as string | undefined;
        return {
          type: 'custom',
          title: (typedData['title'] as string) || 'Notification',
          body: (typedData['body'] as string) || '',
          ...(url ? { url } : {}),
        };
      }
    }
  }

  /**
   * Create digest notification
   */
  private createDigestNotification(notifications: NotificationData[]): NotificationData {
    const typeCounts = notifications.reduce(
      (acc, notif) => {
        acc[notif.type] = (acc[notif.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const summary = Object.entries(typeCounts)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    return {
      type: 'custom',
      title: 'Daily Summary',
      body: `You have ${notifications.length} new notifications: ${summary}`,
      url: '/notifications',
      data: { notifications },
      actions: [
        { action: 'view', title: 'View All' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };
  }

  /**
   * Show basic notification (fallback)
   */
  private showBasicNotification(notification: NotificationData): void {
    if (Notification.permission === 'granted') {
      // Create options with explicit default values for TypeScript strict mode
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        data: notification.data,
      };

      // Only add optional properties if they exist
      if (notification.tag) {
        options.tag = notification.tag;
      }
      if (notification.requireInteraction !== undefined) {
        options.requireInteraction = notification.requireInteraction;
      }
      if (notification.silent !== undefined) {
        options.silent = notification.silent;
      }

      new Notification(notification.title, options);
    }
  }

  /**
   * Process queued messages
   */
  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const notification of queue) {
      await this.sendNotification(notification);
    }
  }

  /**
   * Update analytics
   */
  private updateAnalytics(event: string, type: string): void {
    this.analytics[event as keyof NotificationAnalytics]++;
    this.analytics.byType[type] = (this.analytics.byType[type] || 0) + 1;
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      types: {
        match: true,
        message: true,
        like: true,
        reminder: true,
        promotion: false,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      frequency: 'immediate',
      sound: true,
      vibration: true,
    };
  }

  /**
   * Get default analytics
   */
  private getDefaultAnalytics(): NotificationAnalytics {
    return {
      sent: 0,
      delivered: 0,
      clicked: 0,
      dismissed: 0,
      failed: 0,
      byType: {},
    };
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = localStorage.getItem('notification_preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error(`Failed to load preferences: ${error}`);
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      logger.error(`Failed to save preferences: ${error}`);
    }
  }

  /**
   * Load analytics from storage
   */
  private async loadAnalytics(): Promise<void> {
    try {
      const stored = localStorage.getItem('notification_analytics');
      if (stored) {
        this.analytics = { ...this.analytics, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error(`Failed to load analytics: ${error}`);
    }
  }

  /**
   * Save analytics to storage
   */
  private async saveAnalytics(): Promise<void> {
    try {
      localStorage.setItem('notification_analytics', JSON.stringify(this.analytics));
    } catch (error) {
      logger.error('Failed to save analytics:', { error });
    }
  }
}

const advancedNotificationService = new AdvancedNotificationService();
export default advancedNotificationService;
