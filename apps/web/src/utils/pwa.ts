/**
 * PWA Utilities
 * Handles service worker registration, install prompts, and PWA features
 */

import { logger } from '../services/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    logger.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    logger.info('Service Worker registered successfully', {
      scope: registration.scope,
    });

    // Check for updates every hour
    setInterval(
      () => {
        registration.update();
      },
      60 * 60 * 1000,
    );

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          logger.info('New service worker available');
          showUpdateNotification();
        }
      });
    });

    return registration;
  } catch (error) {
    logger.error('Service Worker registration failed', { error });
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      logger.info('Service Worker unregistered', { success });
      return success;
    }
    return false;
  } catch (error) {
    logger.error('Service Worker unregistration failed', { error });
    return false;
  }
}

/**
 * Setup install prompt handler
 */
export function setupInstallPrompt(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    logger.info('Install prompt ready');

    // Show custom install button
    const event = new CustomEvent('pwa-installable');
    window.dispatchEvent(event);
  });

  window.addEventListener('appinstalled', () => {
    logger.info('PWA installed');
    deferredPrompt = null;

    // Track installation
    if (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['gtag']
    ) {
      const gtag = (window as unknown as Record<string, unknown>)['gtag'] as (
        ...args: unknown[]
      ) => void;
      gtag('event', 'pwa_install', {
        event_category: 'engagement',
      });
    }
  });
}

/**
 * Show install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    logger.warn('Install prompt not available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    logger.info('Install prompt result', { outcome });
    deferredPrompt = null;

    return outcome === 'accepted';
  } catch (error) {
    logger.error('Install prompt failed', { error });
    return false;
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  interface NavigatorWithStandalone extends Navigator {
    standalone?: boolean;
  }
  const isIOSStandalone = (navigator as unknown as NavigatorWithStandalone).standalone === true;

  return isStandalone || isIOSStandalone;
}

/**
 * Check if install prompt is available
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Show update notification
 */
function showUpdateNotification(): void {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('pwa-update-available');
  window.dispatchEvent(event);
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persist();
    logger.info('Persistent storage', { granted: isPersisted });
    return isPersisted;
  } catch (error) {
    logger.error('Persistent storage request failed', { error });
    return false;
  }
}

/**
 * Get storage estimate
 */
export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    logger.info('Storage estimate', { estimate });
    return estimate;
  } catch (error) {
    logger.error('Storage estimate failed', { error });
    return null;
  }
}

/**
 * Check if running as PWA
 */
export function isPWA(): boolean {
  return isAppInstalled();
}

/**
 * Get display mode
 */
export function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (typeof window === 'undefined') return 'browser';

  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
}

/**
 * Initialize PWA features
 */
export function initializePWA(): void {
  if (typeof window === 'undefined') return;

  // Register service worker
  registerServiceWorker();

  // Setup install prompt
  setupInstallPrompt();

  // Request persistent storage for premium users
  if (isAppInstalled()) {
    requestPersistentStorage();
  }

  // Log display mode
  logger.info('PWA initialized', {
    displayMode: getDisplayMode(),
    isInstalled: isAppInstalled(),
  });
}
