/**
 * PWA Utilities
 * Service worker management, offline capabilities, and PWA features
 */

import { useState, useEffect, useCallback } from 'react';

export interface PWAConfig {
  enableServiceWorker: boolean;
  enableOfflineMode: boolean;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
  enablePeriodicSync: boolean;
  cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

export interface OfflineAction {
  id: string;
  type: 'like' | 'pass' | 'message' | 'profile-update';
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
}

export interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  serviceWorkerRegistered: boolean;
  backgroundSyncSupported: boolean;
  pushNotificationSupported: boolean;
  offlineActions: OfflineAction[];
}

/**
 * Hook for PWA functionality
 */
export function usePWA(config: Partial<PWAConfig> = {}) {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstalled: false,
    isStandalone: false,
    serviceWorkerRegistered: false,
    backgroundSyncSupported: false,
    pushNotificationSupported: false,
    offlineActions: [],
  });

  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const defaultConfig: PWAConfig = {
    enableServiceWorker: true,
    enableOfflineMode: true,
    enableBackgroundSync: true,
    enablePushNotifications: true,
    enablePeriodicSync: true,
    cacheStrategy: 'network-first',
  };
  const finalConfig = { ...defaultConfig, ...config };

  // Check capabilities
  const checkCapabilities = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const backgroundSyncSupported = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
    const pushNotificationSupported = 'Notification' in window && 'PushManager' in window;
    
    setState(prev => ({
      ...prev,
      backgroundSyncSupported,
      pushNotificationSupported,
    }));
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setState(prev => ({ ...prev, serviceWorkerRegistered: true }));
      return registration;
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      return false;
    }
  }, []);

  // Check if app is installed
  const checkInstallation = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = 'getInstalledRelatedApps' in navigator || isStandalone;
    setState(prev => ({
      ...prev,
      isStandalone,
      isInstalled: isInstalled || isStandalone,
    }));
  }, []);

  // Handle online/offline status
  const handleOnlineStatus = useCallback(() => {
    if (typeof navigator !== 'undefined') {
      setState(prev => ({ ...prev, isOnline: navigator.onLine }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    checkInstallation();
    checkCapabilities();
    
    if (finalConfig.enableServiceWorker) {
      registerServiceWorker();
    }

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setState(prev => ({ ...prev, isInstalled: false }));
    });

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [checkInstallation, checkCapabilities, registerServiceWorker, handleOnlineStatus, finalConfig.enableServiceWorker]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await (registration as any).pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      // Create new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: getVapidPublicKey(),
      });

      setSubscription(newSubscription);
      
      // Send subscription to server
      await sendSubscriptionToServer(newSubscription);
      
      return newSubscription;
    } catch (error) {
      console.error('[PWA] Failed to subscribe to push notifications:', error);
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
  }, [subscription]);

  // Check current permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    ...state,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
  };
}

/**
 * Utility functions
 */

// Store offline action in IndexedDB
async function storeOfflineAction(action: OfflineAction) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.add(action);
  } catch (error) {
    console.error('[PWA] Failed to store offline action:', error);
  }
}

// Remove offline action from IndexedDB
async function removeStoredOfflineAction(actionId: string) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.delete(actionId);
  } catch (error) {
    console.error('[PWA] Failed to remove offline action:', error);
  }
}

// Load offline actions from IndexedDB
async function loadOfflineActions(): Promise<OfflineAction[]> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result as OfflineAction[]);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[PWA] Failed to load offline actions:', error);
    return [];
  }
}

// Open IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PawfectMatchDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('offlineActions')) {
        const store = db.createObjectStore('offlineActions', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Get VAPID public key (you'll need to implement this)
function getVapidPublicKey(): string {
  // This should return your VAPID public key
  // You can generate one using web-push library
  return 'your-vapid-public-key-here';
}

// Send subscription to server
async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
  } catch (error) {
    console.error('[PWA] Failed to send subscription to server:', error);
  }
}

/**
 * PWA installation utilities
 */
export const pwaUtils = {
  // Show install prompt
  showInstallPrompt: async () => {
    if (typeof window === 'undefined') return false;
    
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await (navigator as any).getInstalledRelatedApps();
        if (relatedApps.length > 0) {
          return false; // Already installed
        }
      } catch (error) {
        console.warn('[PWA] getInstalledRelatedApps not supported:', error);
      }
    }

    // Check if we can show the install prompt
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return false; // Already installed
    }

    return true;
  },

  // Check if app is installable
  isInstallable: () => {
    if (typeof window === 'undefined') return false;
    
    return 'getInstalledRelatedApps' in navigator || 
           window.matchMedia('(display-mode: standalone)').matches;
  },

  // Get app installation status
  getInstallationStatus: () => {
    if (typeof window === 'undefined') {
      return {
        isStandalone: false,
        isInstalled: false,
        canInstall: false,
      };
    }
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = 'getInstalledRelatedApps' in navigator;
    
    return {
      isStandalone,
      isInstalled: isInstalled || isStandalone,
      canInstall: !isStandalone && !isInstalled,
    };
  },

  // Clear all caches
  clearAllCaches: async () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  },

  // Get cache usage
  getCacheUsage: async () => {
    if (typeof navigator === 'undefined' || !('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }

    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
      usage: estimate.usage ? (estimate.usage / estimate.quota!) * 100 : 0
    };
  },
};