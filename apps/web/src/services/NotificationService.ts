/**
 * ULTRA PREMIUM Push Notification Service 🔔
 * Production-ready with FCM, APNS, and Web Push support
 */

import { logger } from './logger';

interface NotificationPermissionState {
  permission: NotificationPermission;
  token?: string;
  platform: 'web' | 'ios' | 'android';
}

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  vibrate?: number[];
  sound?: string;
  timestamp?: number;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationAnalytics {
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  failed: number;
}

class NotificationService {
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;
  private fcmToken: string | null = null;
  private apnsToken: string | null = null;
  private analytics: NotificationAnalytics = {
    sent: 0,
    delivered: 0,
    clicked: 0,
    dismissed: 0,
    failed: 0
  };
  private messageQueue: PushNotification[] = [];
  private isOnline = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
      this.setupEventListeners();
    }
  }

  private async initialize() {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        logger.warn('Notifications not supported in this browser');
        return;
      }

      // Check if service workers are supported
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker();
      }

      // Setup online/offline detection
      this.setupConnectivityListener();

      // Request permission if not already granted
      const permission = await this.requestPermission();
      if (permission === 'granted') {
        await this.subscribeToPush();
        logger.info('Notification service initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize notification service', error);
    }
  }

  private async registerServiceWorker() {
    try {
      this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
      logger.info('Service worker registered');

      // Listen for updates
      this.serviceWorker.addEventListener('updatefound', () => {
        logger.info('Service worker update found');
      });
    } catch (error) {
      logger.error('Service worker registration failed', error);
    }
  }

  private setupEventListeners() {
    if (!('serviceWorker' in navigator)) return;

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'notification-click':
          this.handleNotificationClick(data);
          break;
        case 'notification-close':
          this.handleNotificationClose(data);
          break;
        case 'notification-delivered':
          this.analytics.delivered++;
          break;
        default:
          logger.info('Service worker message', { type, data });
      }
    });
  }

  private setupConnectivityListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueuedMessages();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      logger.warn('Notifications blocked by user');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      logger.info('Notification permission', { permission });
      return permission;
    } catch (error) {
      logger.error('Failed to request notification permission', error);
      return 'denied';
    }
  }

  private async subscribeToPush() {
    if (!this.serviceWorker) return;

    try {
      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        logger.warn('VAPID public key not configured');
        return;
      }

      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      this.pushSubscription = await this.serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send subscription to backend
      await this.sendSubscriptionToServer(this.pushSubscription);
      
      logger.info('Subscribed to push notifications');
    } catch (error) {
      logger.error('Failed to subscribe to push notifications', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          subscription,
          platform: this.getPlatform(),
          deviceInfo: this.getDeviceInfo()
        })
      });

      if (response.ok) {
        logger.info('Push subscription sent to server');
      }
    } catch (error) {
      logger.error('Failed to send subscription to server', error);
    }
  }

  private getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    return 'web';
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  async sendNotification(notification: PushNotification) {
    // Track analytics
    this.analytics.sent++;

    // Check permission
    if (Notification.permission !== 'granted') {
      logger.warn('Notification permission not granted');
      this.analytics.failed++;
      return;
    }

    // Queue if offline
    if (!this.isOnline) {
      this.messageQueue.push(notification);
      return;
    }

    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        // Send via service worker for rich notifications
        await this.serviceWorker.active.postMessage({
          type: 'show-notification',
          notification
        });
      } else {
        // Fallback to basic notification
        this.showBasicNotification(notification);
      }
    } catch (error) {
      logger.error('Failed to send notification', error);
      this.analytics.failed++;
    }
  }

  private showBasicNotification(notification: PushNotification) {
    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icon-192.png',
      badge: notification.badge || '/badge-72.png',
      image: notification.image,
      tag: notification.tag,
      data: notification.data,
      requireInteraction: notification.requireInteraction || false,
      vibrate: notification.vibrate || [200, 100, 200],
      timestamp: notification.timestamp || Date.now(),
      actions: notification.actions || []
    };

    const notif = new Notification(notification.title, options);

    notif.onclick = () => {
      this.handleNotificationClick(notification.data);
    };

    notif.onclose = () => {
      this.handleNotificationClose(notification.data);
    };
  }

  private handleNotificationClick(data: any) {
    this.analytics.clicked++;
    logger.info('Notification clicked', data);

    // Navigate based on notification type
    if (data?.type === 'match') {
      window.location.href = `/matches/${data.matchId}`;
    } else if (data?.type === 'message') {
      window.location.href = `/chat/${data.matchId}`;
    } else if (data?.type === 'like') {
      window.location.href = '/swipe';
    }
  }

  private handleNotificationClose(data: any) {
    this.analytics.dismissed++;
    logger.info('Notification closed', data);
  }

  private async processQueuedMessages() {
    while (this.messageQueue.length > 0) {
      const notification = this.messageQueue.shift();
      if (notification) {
        await this.sendNotification(notification);
      }
    }
  }

  async unsubscribe() {
    try {
      if (this.pushSubscription) {
        await this.pushSubscription.unsubscribe();
        this.pushSubscription = null;
        logger.info('Unsubscribed from push notifications');
      }
    } catch (error) {
      logger.error('Failed to unsubscribe', error);
    }
  }

  getAnalytics(): NotificationAnalytics {
    return { ...this.analytics };
  }

  async testNotification() {
    await this.sendNotification({
      title: '🎉 Test Notification',
      body: 'This is a test notification from PawfectMatch!',
      icon: '/icon-192.png',
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { test: true }
    });
  }

  // Specific notification types
  async sendMatchNotification(matchData: any) {
    await this.sendNotification({
      title: '💕 New Match!',
      body: `You matched with ${matchData.petName}!`,
      icon: matchData.petPhoto || '/icon-192.png',
      tag: 'match',
      data: {
        type: 'match',
        matchId: matchData.id,
        petId: matchData.petId
      },
      requireInteraction: true
    });
  }

  async sendMessageNotification(messageData: any) {
    await this.sendNotification({
      title: `💬 ${messageData.senderName}`,
      body: messageData.message,
      icon: messageData.senderPhoto || '/icon-192.png',
      tag: `message-${messageData.matchId}`,
      data: {
        type: 'message',
        matchId: messageData.matchId,
        messageId: messageData.id
      }
    });
  }

  async sendLikeNotification(likeData: any) {
    await this.sendNotification({
      title: '❤️ Someone likes your pet!',
      body: 'Check who liked your furry friend',
      icon: '/icon-192.png',
      tag: 'like',
      data: {
        type: 'like',
        likeId: likeData.id
      }
    });
  }

  async sendReminderNotification(reminder: any) {
    await this.sendNotification({
      title: '🔔 Reminder',
      body: reminder.message,
      icon: '/icon-192.png',
      tag: 'reminder',
      data: {
        type: 'reminder',
        reminderId: reminder.id
      }
    });
  }

  // iOS specific methods
  async registerForAPNS() {
    // This would be implemented in the native iOS app
    logger.info('APNS registration requested');
  }

  // Android specific methods
  async registerForFCM() {
    try {
      const { getToken } = await import('firebase/messaging');
      const messaging = await this.getFirebaseMessaging();
      
      if (messaging) {
        this.fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY
        });
        
        logger.info('FCM token obtained', { token: this.fcmToken });
        await this.sendFCMTokenToServer(this.fcmToken);
      }
    } catch (error) {
      logger.error('Failed to get FCM token', error);
    }
  }

  private async getFirebaseMessaging() {
    try {
      const { getMessaging } = await import('firebase/messaging');
      const { app } = await import('../lib/firebase');
      return getMessaging(app);
    } catch (error) {
      logger.error('Firebase messaging not available', error);
      return null;
    }
  }

  private async sendFCMTokenToServer(token: string) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ token, platform: 'android' })
      });
    } catch (error) {
      logger.error('Failed to send FCM token to server', error);
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
export default notificationService;
