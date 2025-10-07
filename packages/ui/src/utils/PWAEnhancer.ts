/**
 * 📱 PWA ENHANCER UTILITIES
 * Progressive Web App enhancement utilities for offline support and native-like experience
 * Features: Offline caching, push notifications, and app installation
 */

import { useCallback, useEffect, useState } from 'react';

// Service Worker registration
export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
    }
  }, []);
  
  const registerServiceWorker = useCallback(async (swUrl: string = '/sw.js') => {
    if (!isSupported) return false;
    
    try {
      const reg = await navigator.serviceWorker.register(swUrl);
      setRegistration(reg);
      setIsRegistered(true);
      
      // Handle updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update notification
              console.log('New content available, please refresh');
            }
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }, [isSupported]);
  
  const unregisterServiceWorker = useCallback(async () => {
    if (registration) {
      const success = await registration.unregister();
      setIsRegistered(false);
      setRegistration(null);
      return success;
    }
    return false;
  }, [registration]);
  
  return {
    isSupported,
    isRegistered,
    registration,
    registerServiceWorker,
    unregisterServiceWorker,
  };
};

// Offline status detection
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// App installation
export const useAppInstallation = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    
    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('App installation failed:', error);
      return false;
    }
  }, [deferredPrompt]);
  
  return {
    isInstallable,
    isInstalled,
    installApp,
  };
};

// Push notifications
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);
  
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);
  
  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!isSupported || permission !== 'granted') return null;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      
      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }, [isSupported, permission]);
  
  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      return true;
    }
    return false;
  }, [subscription]);
  
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, options);
    }
  }, [permission]);
  
  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification,
  };
};

// Background sync
export const useBackgroundSync = () => {
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      setIsSupported(true);
    }
  }, []);
  
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!isSupported) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }, [isSupported]);
  
  return {
    isSupported,
    registerBackgroundSync,
  };
};

// Cache management
export const useCacheManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    if ('caches' in window) {
      setIsSupported(true);
    }
  }, []);
  
  const openCache = useCallback(async (cacheName: string) => {
    if (!isSupported) return null;
    
    try {
      return await caches.open(cacheName);
    } catch (error) {
      console.error('Cache open failed:', error);
      return null;
    }
  }, [isSupported]);
  
  const addToCache = useCallback(async (cacheName: string, requests: RequestInfo[]) => {
    if (!isSupported) return false;
    
    try {
      const cache = await openCache(cacheName);
      if (cache) {
        await cache.addAll(requests);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cache add failed:', error);
      return false;
    }
  }, [isSupported, openCache]);
  
  const deleteFromCache = useCallback(async (cacheName: string, request: RequestInfo) => {
    if (!isSupported) return false;
    
    try {
      const cache = await openCache(cacheName);
      if (cache) {
        return await cache.delete(request);
      }
      return false;
    } catch (error) {
      console.error('Cache delete failed:', error);
      return false;
    }
  }, [isSupported, openCache]);
  
  const clearCache = useCallback(async (cacheName: string) => {
    if (!isSupported) return false;
    
    try {
      return await caches.delete(cacheName);
    } catch (error) {
      console.error('Cache clear failed:', error);
      return false;
    }
  }, [isSupported]);
  
  const getCacheSize = useCallback(async (cacheName: string) => {
    if (!isSupported) return 0;
    
    try {
      const cache = await openCache(cacheName);
      if (cache) {
        const keys = await cache.keys();
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error('Cache size calculation failed:', error);
      return 0;
    }
  }, [isSupported, openCache]);
  
  return {
    isSupported,
    openCache,
    addToCache,
    deleteFromCache,
    clearCache,
    getCacheSize,
  };
};

// Share API
export const useShareAPI = () => {
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    if ('share' in navigator) {
      setIsSupported(true);
    }
  }, []);
  
  const share = useCallback(async (data: ShareData) => {
    if (!isSupported) return false;
    
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }, [isSupported]);
  
  return {
    isSupported,
    share,
  };
};

// Device orientation
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  }>({ alpha: null, beta: null, gamma: null });
  
  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientationChange = (event: DeviceOrientationEvent) => {
        setOrientation({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma,
        });
      };
      
      window.addEventListener('deviceorientation', handleOrientationChange);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientationChange);
      };
    }
  }, []);
  
  return orientation;
};

// Vibration API
export const useVibration = () => {
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    if ('vibrate' in navigator) {
      setIsSupported(true);
    }
  }, []);
  
  const vibrate = useCallback((pattern: number | number[]) => {
    if (isSupported) {
      navigator.vibrate(pattern);
    }
  }, [isSupported]);
  
  return {
    isSupported,
    vibrate,
  };
};

// Export all utilities
export const PWAUtils = {
  useServiceWorker,
  useOfflineStatus,
  useAppInstallation,
  usePushNotifications,
  useBackgroundSync,
  useCacheManager,
  useShareAPI,
  useDeviceOrientation,
  useVibration,
};
