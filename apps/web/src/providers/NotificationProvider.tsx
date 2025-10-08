// @ts-nocheck
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import { logger } from '../services/logger';

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
  vibrate?: number[];
  sound?: string;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => Promise<void>;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  permission: 'default',
  requestPermission: async () => 'default',
  showNotification: async () => {},
  isSupported: false,
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      logger.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      logger.info('Notification permission', { permission: result });
      return result;
    } catch (error) {
      logger.error('Failed to request notification permission', error);
      return 'denied';
    }
  }, [isSupported]);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported) {
      logger.warn('Notifications not supported');
      return;
    }

    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') {
        logger.warn('Notification permission denied');
        return;
      }
    }

    try {
      // Use service worker if available for richer notifications
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-96x96.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          actions: options.actions,
          data: options.data,
          vibrate: options.vibrate || [200, 100, 200],
          silent: !options.sound,
        });
      } else {
        // Fallback to basic notification
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-96x96.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          data: options.data,
          vibrate: options.vibrate || [200, 100, 200],
        });

        // Handle notification click
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          notification.close();
          
          if (options.data?.url) {
            window.location.href = options.data.url;
          }
        };
      }
      
      logger.info('Notification shown', { title: options.title });
    } catch (error) {
      logger.error('Failed to show notification', error);
    }
  }, [isSupported, permission, requestPermission]);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission, showNotification, isSupported }}>
      {children}
    </NotificationContext.Provider>
  );
};
