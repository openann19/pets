'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { logger } from '../services/logger';

interface CustomNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: {
    url?: string;
    [key: string]: unknown;
  } | undefined;
  vibrate?: number[];
  sound?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: CustomNotificationOptions) => Promise<void>;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  permission: 'default',
  requestPermission: async () => 'default',
  showNotification: async () => { },
  isSupported: false,
});

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to request notification permission', { errorMessage });
      return 'denied';
    }
  }, [isSupported]);

  const showNotification = useCallback(
    async (options: CustomNotificationOptions) => {
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

          const swOptions: Partial<NotificationOptions> = {
            icon: options.icon || '/icon-192x192.png',
            badge: options.badge || '/icon-96x96.png',
            ...(options.data && { data: options.data }),
          };

          // Only add properties if they exist
          if (options.body) swOptions.body = options.body;
          if (options.tag) swOptions.tag = options.tag;
          if (options.requireInteraction !== undefined) swOptions.requireInteraction = options.requireInteraction;
          if (options.actions) swOptions.actions = options.actions;
          if (options.vibrate) swOptions.vibrate = options.vibrate;
          // Note: 'silent' is not a standard NotificationOptions property

          await registration.showNotification(options.title, swOptions as NotificationOptions);
        } else {
          const notificationOptions: Partial<NotificationOptions> = {
            icon: options.icon || '/icon-192x192.png',
            badge: options.badge || '/icon-96x96.png',
            ...(options.data && { data: options.data }),
          };

          if (options.body) notificationOptions.body = options.body;
          if (options.tag) notificationOptions.tag = options.tag;
          if (options.requireInteraction !== undefined) {
            notificationOptions.requireInteraction = options.requireInteraction;
          }

          const notification = new Notification(options.title, notificationOptions);

          // Handle notification click
          notification.onclick = (event): void => {
            if (event) {
              event.preventDefault();
            }
            window.focus();
            notification.close();

            if (options.data?.url) {
              window.location.href = options.data.url;
            }
          };
        }

        logger.info('Notification shown', { title: options.title });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to show notification', { errorMessage });
      }
    },
    [isSupported, permission, requestPermission],
  );

  return (
    <NotificationContext.Provider
      value={{ permission, requestPermission, showNotification, isSupported }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
