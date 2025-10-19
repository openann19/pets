import { useCallback, useEffect, useState } from 'react';

export interface UseNotificationsReturn {
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermission;
  showNotificationPrompt: boolean;
  checkNotificationSupport: () => boolean;
  requestNotificationPermission: () => Promise<void>;
  dismissNotificationPrompt: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const checkNotificationSupport = useCallback(() => {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }, []);

  const checkNotificationPermission = useCallback(async () => {
    if (!checkNotificationSupport()) return;

    const permission = Notification.permission;
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setNotificationsEnabled(true);
    } else if (permission === 'default') {
      setShowNotificationPrompt(true);
    }
  }, [checkNotificationSupport]);

  const requestNotificationPermission = useCallback(async () => {
    if (!checkNotificationSupport()) return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        await subscribeToNotifications();
        setNotificationsEnabled(true);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
    setShowNotificationPrompt(false);
  }, [checkNotificationSupport]);

  const subscribeToNotifications = useCallback(async () => {
    if (!checkNotificationSupport()) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'] || '',
      });

      // This would typically send the subscription to your backend
      console.log('Push subscription created:', subscription);
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  }, [checkNotificationSupport]);

  const dismissNotificationPrompt = useCallback(() => {
    setShowNotificationPrompt(false);
  }, []);

  // Check permissions on mount
  useEffect(() => {
    checkNotificationPermission();
  }, [checkNotificationPermission]);

  return {
    notificationsEnabled,
    notificationPermission,
    showNotificationPrompt,
    checkNotificationSupport,
    requestNotificationPermission,
    dismissNotificationPrompt,
  };
};
