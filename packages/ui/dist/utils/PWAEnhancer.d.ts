/**
 * 📱 PWA ENHANCER UTILITIES
 * Progressive Web App enhancement utilities for offline support and native-like experience
 * Features: Offline caching, push notifications, and app installation
 */
export declare const useServiceWorker: () => {
    isSupported: boolean;
    isRegistered: boolean;
    registration: ServiceWorkerRegistration | null;
    registerServiceWorker: (swUrl?: string) => Promise<boolean>;
    unregisterServiceWorker: () => Promise<boolean>;
};
export declare const useOfflineStatus: () => boolean;
export declare const useAppInstallation: () => {
    isInstallable: boolean;
    isInstalled: boolean;
    installApp: () => Promise<boolean>;
};
export declare const usePushNotifications: () => {
    isSupported: boolean;
    permission: NotificationPermission;
    subscription: PushSubscription | null;
    requestPermission: () => Promise<boolean>;
    subscribeToPush: (vapidPublicKey: string) => Promise<PushSubscription | null>;
    unsubscribeFromPush: () => Promise<boolean>;
    sendNotification: (title: string, options?: NotificationOptions) => void;
};
export declare const useBackgroundSync: () => {
    isSupported: boolean;
    registerBackgroundSync: (tag: string) => Promise<boolean>;
};
export declare const useCacheManager: () => {
    isSupported: boolean;
    openCache: (cacheName: string) => Promise<Cache | null>;
    addToCache: (cacheName: string, requests: RequestInfo[]) => Promise<boolean>;
    deleteFromCache: (cacheName: string, request: RequestInfo) => Promise<boolean>;
    clearCache: (cacheName: string) => Promise<boolean>;
    getCacheSize: (cacheName: string) => Promise<number>;
};
export declare const useShareAPI: () => {
    isSupported: boolean;
    share: (data: ShareData) => Promise<boolean>;
};
export declare const useDeviceOrientation: () => {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
};
export declare const useVibration: () => {
    isSupported: boolean;
    vibrate: (pattern: number | number[]) => void;
};
export declare const PWAUtils: {
    useServiceWorker: () => {
        isSupported: boolean;
        isRegistered: boolean;
        registration: ServiceWorkerRegistration | null;
        registerServiceWorker: (swUrl?: string) => Promise<boolean>;
        unregisterServiceWorker: () => Promise<boolean>;
    };
    useOfflineStatus: () => boolean;
    useAppInstallation: () => {
        isInstallable: boolean;
        isInstalled: boolean;
        installApp: () => Promise<boolean>;
    };
    usePushNotifications: () => {
        isSupported: boolean;
        permission: NotificationPermission;
        subscription: PushSubscription | null;
        requestPermission: () => Promise<boolean>;
        subscribeToPush: (vapidPublicKey: string) => Promise<PushSubscription | null>;
        unsubscribeFromPush: () => Promise<boolean>;
        sendNotification: (title: string, options?: NotificationOptions) => void;
    };
    useBackgroundSync: () => {
        isSupported: boolean;
        registerBackgroundSync: (tag: string) => Promise<boolean>;
    };
    useCacheManager: () => {
        isSupported: boolean;
        openCache: (cacheName: string) => Promise<Cache | null>;
        addToCache: (cacheName: string, requests: RequestInfo[]) => Promise<boolean>;
        deleteFromCache: (cacheName: string, request: RequestInfo) => Promise<boolean>;
        clearCache: (cacheName: string) => Promise<boolean>;
        getCacheSize: (cacheName: string) => Promise<number>;
    };
    useShareAPI: () => {
        isSupported: boolean;
        share: (data: ShareData) => Promise<boolean>;
    };
    useDeviceOrientation: () => {
        alpha: number | null;
        beta: number | null;
        gamma: number | null;
    };
    useVibration: () => {
        isSupported: boolean;
        vibrate: (pattern: number | number[]) => void;
    };
};
//# sourceMappingURL=PWAEnhancer.d.ts.map