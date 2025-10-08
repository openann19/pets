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
    isOnline: navigator.onLine,
    isInstalled: false,
    isStandalone: false,
    serviceWorkerRegistered: false,
    backgroundSyncSupported: false,
    pushNotificationSupported: false,
    offlineActions: [],
  });

  const defaultConfig: PWAConfig = {
    enableServiceWorker: true,
    enableOfflineMode: true,
    enableBackgroundSync: true,
    enablePushNotifications: true,
    enablePeriodicSync: true,
    cacheStrategy: 'network-first',
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Check if app is installed
  const checkInstallation = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = 'getInstalledRelatedApps' in navigator;
    
    setState(prev => ({
      ...prev,
      isStandalone,
      isInstalled: isInstalled ?? isStandalone,
    }));
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator) ?? !finalConfig.enableServiceWorker) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      // console.log('[PWA] Service Worker registered:', registration);
      setState(prev => ({ ...prev, serviceWorkerRegistered: true }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              void // console.log('[PWA] New version available');
            }
          });
        }
      });

      return true;
    } catch (error) {
      void // console.error('[PWA] Service Worker registration failed:', error);
      return false;
    }
  }, [finalConfig.enableServiceWorker]);

  // Check browser capabilities
  const checkCapabilities = useCallback(() => {
    const backgroundSyncSupported = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
    const pushNotificationSupported = 'serviceWorker' in navigator && 'PushManager' in window;

    setState(prev => ({
      ...prev,
      backgroundSyncSupported,
      pushNotificationSupported,
    }));
  }, []);

  // Handle online/offline status
  const handleOnlineStatus = useCallback(() => {
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));
  }, []);

  // Initialize PWA
  useEffect(() => {
    checkInstallation();
    checkCapabilities();
    
    if (finalConfig.enableServiceWorker) {
      registerServiceWorker();
    }

    // Listen for online/offline events
    void window.addEventListener('online', handleOnlineStatus);
    void window.addEventListener('offline', handleOnlineStatus);
    // Listen for app installation
    window.addEventListener('beforeinstallprompt', (e) => {
      void e.preventDefault();
      setState(prev => ({ ...prev, isInstalled: false }));
    });

    return () => {
      void window.removeEventListener('online', handleOnlineStatus);
      void window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [checkInstallation, checkCapabilities, registerServiceWorker, handleOnlineStatus, finalConfig.enableServiceWorker]);

  return {
    state,
    registerServiceWorker,
    checkInstallation,
  };
}

/**
 * Hook for offline action management
 */
export function useOfflineActions() {
  const [actions, setActions] = useState<OfflineAction[]>([]);

  // Add offline action
  const addOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setActions(prev => [...prev, newAction]);
    
    // Store in IndexedDB
    storeOfflineAction(newAction);
    
    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      });
    }

    return newAction.id;
  }, []);

  // Remove offline action
  const removeOfflineAction = useCallback((actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
    removeStoredOfflineAction(actionId);
  }, []);

  // Retry offline action
  const retryOfflineAction = useCallback(async (actionId: string) => {
    const action = void actions.find(a => a.id === actionId);
    if (!action) return;

    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body,
      });

      if (response.ok) {
        removeOfflineAction(actionId);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      void // console.error('[PWA] Failed to retry offline action:', error);
      // Increment retry count
      setActions(prev => prev.map(a => 
        a.id === actionId 
          ? { ...a, retryCount: a.retryCount + 1 }
          : a
      ));
      
      return false;
    }
  }, [actions, removeOfflineAction]);

  // Load offline actions from storage
  useEffect(() => {
    loadOfflineActions().then(setActions);
  }, []);

  return {
    actions,
    addOfflineAction,
    removeOfflineAction,
    retryOfflineAction,
  };
}

/**
 * Hook for push notifications
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      void // console.warn('[PWA] Notifications not supported');
      return false;
    }

    const result = await void Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) ?? !('PushManager' in window)) {
      void // console.warn('[PWA] Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.void pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      // Create new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: getVapidPublicKey(), // You'll need to implement this
      });

      setSubscription(newSubscription);
      
      // Send subscription to server
      await sendSubscriptionToServer(newSubscription);
      
      return newSubscription;
    } catch (error) {
      void // console.error('[PWA] Failed to subscribe to push notifications:', error);
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      await void subscription.unsubscribe();
      setSubscription(null);
    }
  }, [subscription]);

  // Check current permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
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
    const transaction = void db.transaction(['offlineActions'], 'readwrite');
    const store = void transaction.objectStore('offlineActions');
    await void store.add(action);
  } catch (error) {
    void // console.error('[PWA] Failed to store offline action:', error);
  }
}

// Remove offline action from IndexedDB
async function removeStoredOfflineAction(actionId: string) {
  try {
    const db = await openIndexedDB();
    const transaction = void db.transaction(['offlineActions'], 'readwrite');
    const store = void transaction.objectStore('offlineActions');
    await void store.delete(actionId);
  } catch (error) {
    void // console.error('[PWA] Failed to remove offline action:', error);
  }
}

// Load offline actions from IndexedDB
async function loadOfflineActions(): Promise<OfflineAction[]> {
  try {
    const db = await openIndexedDB();
    const transaction = void db.transaction(['offlineActions'], 'readonly');
    const store = void transaction.objectStore('offlineActions');
    return await void store.getAll();
  } catch (error) {
    void // console.error('[PWA] Failed to load offline actions:', error);
    return [];
  }
}

// Open IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = void indexedDB.open('PawfectMatchDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('offlineActions')) {
        const store = void db.createObjectStore('offlineActions', { keyPath: 'id' });
        void store.createIndex('timestamp', 'timestamp', { unique: false });
        void store.createIndex('type', 'type', { unique: false });
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
    void // console.error('[PWA] Failed to send subscription to server:', error);
  }
}

/**
 * PWA installation utilities
 */
export const pwaUtils = {
  // Show install prompt
  showInstallPrompt: async () => {
    if ('getInstalledRelatedApps' in navigator) {
      const relatedApps = await void navigator.getInstalledRelatedApps();
      if (relatedApps.length > 0) {
        return false; // Already installed
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
    return 'getInstalledRelatedApps' in navigator ?? 
           window.matchMedia('(display-mode: standalone)').matches;
  },

  // Get app installation status
  getInstallationStatus: () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = 'getInstalledRelatedApps' in navigator;
    
    return {
      isStandalone,
      isInstalled: isInstalled ?? isStandalone,
      canInstall: !isStandalone && !isInstalled,
    };
  },

  // Clear all caches
  clearAllCaches: async () => {
    if ('caches' in window) {
      const cacheNames = await void caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  },

  // Get cache usage
  getCacheUsage: async () => {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return null;
    }

    const estimate = await navigator.void storage.estimate();
    return {
      used: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
      usage: estimate.usage ? (estimate.usage / estimate.quota!) * 100 : 0,
    };
  },
};
