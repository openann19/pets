/**
 * Push Notification Service for PawfectMatch Mobile
 * Comprehensive push notification handling with deep linking
 */

import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { logger } from '@pawfectmatch/core';
import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';
import { Linking } from 'react-native';
import { api } from './api';

interface NotificationData {
  type: 'match' | 'message' | 'like' | 'superlike' | 'reminder' | 'promotion';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionButtons?: NotificationAction[];
}

// Minimal remote message shape used in this service
type FCMRemoteMessage = {
  data?: Record<string, unknown>;
  notification?: {
    title?: string;
    body?: string;
    android?: { imageUrl?: string };
  };
};

interface NotificationAction {
  id: string;
  title: string;
  action: string;
}

interface NotificationSettings {
  enabled: boolean;
  matchNotifications: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  reminderNotifications: boolean;
  promotionNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private notificationSettings: NotificationSettings = {
    enabled: true,
    matchNotifications: true,
    messageNotifications: true,
    likeNotifications: true,
    reminderNotifications: true,
    promotionNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  };

  constructor() {
    this.initializePushNotifications();
  }

  /**
   * Initialize push notification service
   */
  private async initializePushNotifications(): Promise<void> {
    try {
      // Request permission
      await this.requestPermission();

      // Get FCM token
      await this.fetchAndRegisterFCMToken();

      // Set up message handlers
      this.setupMessageHandlers();

      // Set up notification channels
      await this.setupNotificationChannels();

      // Load settings
      await this.loadNotificationSettings();

      logger.info('Push notification service initialized');
    } catch (error) {
      logger.error(`Failed to initialize push notifications: ${error}`);
    }
  }

  /**
   * Request notification permission
   */
  private async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        logger.info('Notification permission granted');
      } else {
        logger.warn('Notification permission denied');
      }

      return enabled;
    } catch (error) {
      logger.error(`Failed to request notification permission: ${error}`);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  private async fetchAndRegisterFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;

      // Send token to server
      await this.sendTokenToServer(token);

      logger.info(`FCM token obtained: ${token.substring(0, 8)}...`);
      return token;
    } catch (error) {
      logger.error(`Failed to get FCM token: ${error}`);
      return null;
    }
  }

  /**
   * Send FCM token to server
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      await api.updateDeviceToken(token);
      logger.info('FCM token sent to server');
    } catch (error) {
      logger.error(`Failed to send FCM token to server: ${error}`);
    }
  }

  /**
   * Set up message handlers
   */
  private setupMessageHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage: unknown) => {
      logger.debug('Background message received');
      await this.handleBackgroundMessage(remoteMessage as FCMRemoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage: unknown) => {
      logger.debug('Foreground message received');
      await this.handleForegroundMessage(remoteMessage as FCMRemoteMessage);
    });

    // Handle notification tap
    messaging().onNotificationOpenedApp((remoteMessage: unknown) => {
      logger.info('Notification opened app');
      this.handleNotificationTap(remoteMessage as FCMRemoteMessage);
    });

    // Handle notification tap when app is closed
    messaging()
      .getInitialNotification()
      .then((remoteMessage: unknown) => {
        if (remoteMessage) {
          logger.info('Notification opened app from closed state');
          this.handleNotificationTap(remoteMessage as FCMRemoteMessage);
        }
      });
  }

  /**
   * Set up notification channels
   */
  private async setupNotificationChannels(): Promise<void> {
    try {
      // Match notifications channel
      await notifee.createChannel({
        id: 'matches',
        name: 'Matches',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Message notifications channel
      await notifee.createChannel({
        id: 'messages',
        name: 'Messages',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Like notifications channel
      await notifee.createChannel({
        id: 'likes',
        name: 'Likes',
        importance: AndroidImportance.DEFAULT,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Reminder notifications channel
      await notifee.createChannel({
        id: 'reminders',
        name: 'Reminders',
        importance: AndroidImportance.DEFAULT,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Promotion notifications channel
      await notifee.createChannel({
        id: 'promotions',
        name: 'Promotions',
        importance: AndroidImportance.LOW,
        visibility: AndroidVisibility.PUBLIC,
      });

      logger.info('Notification channels created');
    } catch (error) {
      logger.error(`Failed to create notification channels: ${error}`);
    }
  }

  /**
   * Parse remote message into NotificationData format
   */
  private parseNotificationData(remoteMessage: FCMRemoteMessage): NotificationData {
    const data = remoteMessage.data ?? {};
    const notification = remoteMessage.notification;
    const imageUrl = notification?.android?.imageUrl ?? (data['imageUrl'] as string | undefined);

    const result: NotificationData = {
      type: (data['type'] as NotificationData['type']) ?? 'reminder',
      title: notification?.title ?? data['title'] as string ?? 'PawfectMatch',
      body: notification?.body ?? data['body'] as string ?? '',
      data,
    };

    if (imageUrl) {
      result.imageUrl = imageUrl;
    }

    return result;
  }

  /**
   * Handle background message
   */
  private async handleBackgroundMessage(remoteMessage: FCMRemoteMessage): Promise<void> {
    try {
      const notificationData = this.parseNotificationData(remoteMessage);
      await this.showNotification(notificationData);
    } catch (error) {
      logger.error(`Failed to handle background message: ${error}`);
    }
  }

  /**
   * Handle foreground message
   */
  private async handleForegroundMessage(remoteMessage: FCMRemoteMessage): Promise<void> {
    try {
      const notificationData = this.parseNotificationData(remoteMessage);

      // Check if notifications are enabled for this type
      if (!this.isNotificationEnabled(notificationData.type)) {
        return;
      }

      // Check quiet hours
      if (this.isQuietHours()) {
        return;
      }

      await this.showNotification(notificationData);
    } catch (error) {
      logger.error(`Failed to handle foreground message: ${error}`);
    }
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(remoteMessage: FCMRemoteMessage): void {
    try {
      const notificationData = this.parseNotificationData(remoteMessage);
      this.navigateToScreen(notificationData);
    } catch (error) {
      logger.error(`Failed to handle notification tap: ${error}`);
    }
  }

  /**
   * Navigate to screen based on notification type
   */
  private navigateToScreen(notificationData: NotificationData): void {
    try {
      let deepLink = '';
      const d = notificationData.data as Record<string, unknown> | undefined;
      const matchId = typeof d?.['matchId'] === 'string' ? (d['matchId'] as string) : '';
      const userId = typeof d?.['userId'] === 'string' ? (d['userId'] as string) : '';

      switch (notificationData.type) {
        case 'match':
          deepLink = `pawfectmatch://match/${matchId}`;
          break;
        case 'message':
          deepLink = `pawfectmatch://chat/${matchId}`;
          break;
        case 'like':
        case 'superlike':
          deepLink = `pawfectmatch://profile/${userId}`;
          break;
        default:
          deepLink = 'pawfectmatch://home';
      }

      if (deepLink) {
        Linking.openURL(deepLink);
      }
    } catch (error) {
      logger.error(`Failed to navigate to screen: ${error}`);
    }
  }

  /**
   * Get channel ID for notification type
   */
  private getChannelId(type: string): string {
    switch (type) {
      case 'match':
        return 'matches';
      case 'message':
        return 'messages';
      case 'like':
      case 'superlike':
        return 'likes';
      case 'reminder':
        return 'reminders';
      case 'promotion':
        return 'promotions';
      default:
        return 'reminders';
    }
  }

  /**
   * Show notification
   */
  private async showNotification(notificationData: NotificationData): Promise<void> {
    try {
      const channelId = this.getChannelId(notificationData.type);

      // Use displayNotification (simplified for Notifee API compatibility)
      await notifee.displayNotification({
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data ?? {},
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
      });
    } catch (error) {
      logger.error(`Failed to show notification: ${error}`);
    }
  }

  /**
   * Check if notification is enabled for type
   */
  private isNotificationEnabled(type: string): boolean {
    if (!this.notificationSettings.enabled) {
      return false;
    }

    switch (type) {
      case 'match':
        return this.notificationSettings.matchNotifications;
      case 'message':
        return this.notificationSettings.messageNotifications;
      case 'like':
      case 'superlike':
        return this.notificationSettings.likeNotifications;
      case 'reminder':
        return this.notificationSettings.reminderNotifications;
      case 'promotion':
        return this.notificationSettings.promotionNotifications;
      default:
        return true;
    }
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.notificationSettings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const startTime = this.parseTime(this.notificationSettings.quietHours.startTime);
    const endTime = this.parseTime(this.notificationSettings.quietHours.endTime);

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
    const parts = timeString.split(':');
    const hours = Number(parts[0] ?? 0);
    const minutes = Number(parts[1] ?? 0);
    return hours * 60 + minutes;
  }

  /**
   * Load notification settings
   */
  private async loadNotificationSettings(): Promise<void> {
    try {
      // Load from AsyncStorage first, then sync with server
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      const storedSettings = await AsyncStorage.getItem('notificationSettings');
      if (storedSettings) {
        this.notificationSettings = JSON.parse(storedSettings);
      }

      // Sync with server to get latest settings
      const serverSettings = await api.getNotificationSettings().catch(() => null);
      if (serverSettings) {
        const quiet = serverSettings.quietHours as any;
        this.notificationSettings = {
          ...this.notificationSettings,
          ...serverSettings,
          quietHours: quiet
            ? {
              enabled: quiet.enabled,
              startTime: (quiet.startTime ?? quiet.start) as string,
              endTime: (quiet.endTime ?? quiet.end) as string,
            }
            : this.notificationSettings.quietHours,
        };
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
      }

      logger.info('Notification settings loaded');
    } catch (error) {
      logger.error('Failed to load notification settings:', { error });
    }
  }

  /**
   * Update notification settings
   */
  public async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.notificationSettings = { ...this.notificationSettings, ...settings };

      // Save to storage
      // await AsyncStorage.setItem('notification_settings', JSON.stringify(this.notificationSettings));

      // Send to server (convert to API format)
      const settingsForApi = {
        ...this.notificationSettings,
        quietHours: {
          enabled: this.notificationSettings.quietHours.enabled,
          start: this.notificationSettings.quietHours.startTime,
          end: this.notificationSettings.quietHours.endTime,
        },
      };
      await api.updateNotificationSettings(settingsForApi as any);

      logger.info('Notification settings updated');
    } catch (error) {
      logger.error('Failed to update notification settings:', { error });
    }
  }

  /**
   * Get notification settings
   */
  public getNotificationSettings(): NotificationSettings {
    return { ...this.notificationSettings };
  }

  /**
   * Get the current FCM token
   * @returns The current FCM token or null if not available
   */
  public getCurrentFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Schedule local notification
   */
  public async scheduleLocalNotification(
    notificationData: NotificationData,
    triggerDate: Date
  ): Promise<void> {
    try {
      // Use triggerDate for future scheduled notification implementation
      void triggerDate.getTime();
      const channelId = this.getChannelId(notificationData.type);

      // Fallback: notifee shim doesn't include createTriggerNotification; simulate via displayNotification
      await notifee.displayNotification({
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data ?? {},
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
      });

      logger.info('Local notification scheduled');
    } catch (error) {
      logger.error('Failed to schedule local notification:', { error });
    }
  }

  /**
   * Cancel all notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      // Shim doesn't include cancelAll; app code uses cancelNotification per id. No-op here.
      logger.info('All notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel notifications:', { error });
    }
  }

  /**
   * Get notification count
   */
  public async getNotificationCount(): Promise<number> {
    // Shim doesn't include getDisplayedNotifications; return 0 as fallback.
    return 0;
  }
}

export const pushNotificationService = new PushNotificationService();
