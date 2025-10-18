interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private static instance: PushNotificationManager | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isSupported = false;
  private permissionState: NotificationPermission = 'default';

  private constructor() {
    this.checkSupport();
  }

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  private checkSupport() {
    this.isSupported = 
      'serviceWorker' in navigator && 
      'PushManager' in window && 
      'Notification' in window;
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('[Push] Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await this.registerServiceWorker();
      
      // Check notification permission
      this.permissionState = Notification.permission;
      
      // Get existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      console.log('[Push] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Push] Initialization failed:', error);
      return false;
    }
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[Push] Service Worker registered');

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              this.notifyUpdate();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      throw error;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('[Push] Push notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionState = permission;
      
      console.log('[Push] Permission:', permission);
      
      if (permission === 'granted') {
        await this.subscribe();
      }
      
      return permission;
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return 'denied';
    }
  }

  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error('[Push] No service worker registration');
      return null;
    }

    if (this.permissionState !== 'granted') {
      console.warn('[Push] Permission not granted');
      return null;
    }

    try {
      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.warn('[Push] VAPID public key not configured');
        return null;
      }

      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      console.log('[Push] Subscribed successfully');

      // Convert subscription to JSON
      const subscriptionData = this.subscriptionToJSON(this.subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscriptionData);

      return subscriptionData;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      console.warn('[Push] No active subscription');
      return false;
    }

    try {
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        // Notify server about unsubscription
        await this.removeSubscriptionFromServer();
        this.subscription = null;
        console.log('[Push] Unsubscribed successfully');
      }
      
      return success;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }

  async sendTestNotification(): Promise<void> {
    if (this.permissionState !== 'granted') {
      console.warn('[Push] Permission not granted');
      return;
    }

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        console.log('[Push] Test notification sent');
      } else {
        console.error('[Push] Failed to send test notification');
      }
    } catch (error) {
      console.error('[Push] Error sending test notification:', error);
    }
  }

  showLocalNotification(title: string, options?: NotificationOptions): void {
    if (this.permissionState !== 'granted') {
      console.warn('[Push] Permission not granted');
      return;
    }

    if (!this.registration) {
      console.warn('[Push] No service worker registration');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'local-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };

    this.registration.showNotification(title, defaultOptions);
  }

  async checkPermissionStatus(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    this.permissionState = Notification.permission;
    return this.permissionState;
  }

  getSubscriptionStatus(): {
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    subscription: PushSubscriptionData | null;
  } {
    return {
      isSupported: this.isSupported,
      permission: this.permissionState,
      isSubscribed: !!this.subscription,
      subscription: this.subscription ? this.subscriptionToJSON(this.subscription) : null
    };
  }

  // Helper methods

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

  private subscriptionToJSON(subscription: PushSubscription): PushSubscriptionData {
    const json = subscription.toJSON();
    return {
      endpoint: json.endpoint || '',
      keys: {
        p256dh: json.keys?.p256dh || '',
        auth: json.keys?.auth || ''
      }
    };
  }

  private async sendSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('[Push] Subscription sent to server');
    } catch (error) {
      console.error('[Push] Error sending subscription to server:', error);
      throw error;
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('[Push] Subscription removed from server');
    } catch (error) {
      console.error('[Push] Error removing subscription from server:', error);
    }
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private notifyUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sw-update-available'));
      
      // Show update notification
      this.showLocalNotification('Update Available', {
        body: 'A new version of PawfectMatch is available. Click to refresh.',
        tag: 'update-notification',
        requireInteraction: true,
        data: {
          action: 'refresh'
        }
      });
    }
  }

  // Service worker communication

  async sendMessageToServiceWorker(message: any): Promise<any> {
    if (!this.registration || !this.registration.active) {
      console.warn('[Push] No active service worker');
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      this.registration.active.postMessage(message, [messageChannel.port2]);
    });
  }

  async queueMessageForSync(message: any): Promise<void> {
    await this.sendMessageToServiceWorker({
      type: 'queue-message',
      message
    });
  }

  async checkForUpdates(): Promise<void> {
    await this.sendMessageToServiceWorker({
      type: 'check-updates'
    });
  }

  // Static helper methods

  static async isSupported(): Promise<boolean> {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  static async getPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Export singleton getter for convenience
export const getPushNotificationManager = () => PushNotificationManager.getInstance();