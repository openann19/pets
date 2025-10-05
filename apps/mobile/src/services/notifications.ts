/**
 * Push Notifications Service for PawfectMatch Mobile
 * Professional implementation with Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'match' | 'message' | 'like' | 'super_like' | 'premium' | 'reminder';
  title: string;
  body: string;
  data?: any;
  scheduledFor?: Date;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<string | null> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get the token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;

      // Store token locally
      await AsyncStorage.setItem('expo_push_token', token);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B6B',
        });

        // Create specific channels for different notification types
        await this.createNotificationChannels();
      }

      // Set up listeners
      this.setupListeners();

      console.log('Push notifications initialized successfully');
      return token;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  private async createNotificationChannels() {
    const channels = [
      {
        id: 'matches',
        name: 'New Matches',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Notifications for new matches',
        sound: 'match_sound.wav',
      },
      {
        id: 'messages',
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'New message notifications',
        sound: 'message_sound.wav',
      },
      {
        id: 'likes',
        name: 'Likes',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Someone liked your pet',
        sound: 'like_sound.wav',
      },
      {
        id: 'reminders',
        name: 'Reminders',
        importance: Notifications.AndroidImportance.LOW,
        description: 'App usage reminders',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        description: channel.description,
        sound: channel.sound,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }
  }

  private setupListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotificationReceived(notification: Notifications.Notification) {
    const { data } = notification.request.content;
    
    // Handle different notification types
    switch (data?.type) {
      case 'match':
        // Could trigger a celebration animation
        break;
      case 'message':
        // Could update unread count
        break;
      case 'like':
        // Could show a brief toast
        break;
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { data } = response.notification.request.content;
    
    // Navigate to appropriate screen based on notification type
    switch (data?.type) {
      case 'match':
        // Navigate to matches screen
        break;
      case 'message':
        // Navigate to specific chat
        if (data.matchId) {
          // NavigationService.navigate('Chat', { matchId: data.matchId });
        }
        break;
      case 'like':
        // Navigate to likes screen
        break;
    }
  }

  async sendLocalNotification(notificationData: NotificationData) {
    try {
      const { type, title, body, data, scheduledFor } = notificationData;

      const notificationConfig: Notifications.NotificationRequestInput = {
        content: {
          title,
          body,
          data: { type, ...data },
          sound: this.getSoundForType(type),
          badge: await this.getBadgeCount() + 1,
        },
        trigger: scheduledFor 
          ? { date: scheduledFor }
          : null,
      };

      // Set channel for Android
      if (Platform.OS === 'android') {
        notificationConfig.content.categoryIdentifier = this.getChannelForType(type);
      }

      const identifier = await Notifications.scheduleNotificationAsync(notificationConfig);
      console.log('Local notification scheduled:', identifier);
      
      return identifier;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  async sendPushNotification(
    targetToken: string,
    notificationData: NotificationData
  ): Promise<boolean> {
    try {
      const { type, title, body, data } = notificationData;

      const message = {
        to: targetToken,
        sound: 'default',
        title,
        body,
        data: { type, ...data },
        badge: 1,
        channelId: this.getChannelForType(type),
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      
      return result.data?.status === 'ok';
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  private getSoundForType(type: string): string {
    switch (type) {
      case 'match':
        return 'match_sound.wav';
      case 'message':
        return 'message_sound.wav';
      case 'like':
      case 'super_like':
        return 'like_sound.wav';
      default:
        return 'default';
    }
  }

  private getChannelForType(type: string): string {
    switch (type) {
      case 'match':
        return 'matches';
      case 'message':
        return 'messages';
      case 'like':
      case 'super_like':
        return 'likes';
      case 'reminder':
        return 'reminders';
      default:
        return 'default';
    }
  }

  private async getBadgeCount(): Promise<number> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count || 0;
    } catch {
      return 0;
    }
  }

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge() {
    await this.setBadgeCount(0);
  }

  async cancelNotification(identifier: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Predefined notification templates
  async sendMatchNotification(petName: string, petPhoto: string) {
    return this.sendLocalNotification({
      type: 'match',
      title: '🎉 It\'s a Match!',
      body: `You and ${petName} liked each other!`,
      data: { petName, petPhoto },
    });
  }

  async sendMessageNotification(senderName: string, message: string, matchId: string) {
    return this.sendLocalNotification({
      type: 'message',
      title: `New message from ${senderName}`,
      body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: { matchId, senderName },
    });
  }

  async sendLikeNotification(petName: string, isSuper: boolean = false) {
    return this.sendLocalNotification({
      type: isSuper ? 'super_like' : 'like',
      title: isSuper ? '⭐ Super Like!' : '❤️ Someone likes you!',
      body: `${petName} ${isSuper ? 'super ' : ''}liked your pet!`,
      data: { petName, isSuper },
    });
  }

  async scheduleReminderNotification(hours: number = 24) {
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + hours);

    return this.sendLocalNotification({
      type: 'reminder',
      title: 'Come back to PawfectMatch! 🐾',
      body: 'New pets are waiting to meet you!',
      scheduledFor,
    });
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Utility hook for React components
export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [pushToken, setPushToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initializeNotifications = async () => {
      const token = await notificationService.initialize();
      setPushToken(token);
      setIsInitialized(true);
    };

    initializeNotifications();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  return {
    isInitialized,
    pushToken,
    sendMatchNotification: notificationService.sendMatchNotification.bind(notificationService),
    sendMessageNotification: notificationService.sendMessageNotification.bind(notificationService),
    sendLikeNotification: notificationService.sendLikeNotification.bind(notificationService),
    scheduleReminderNotification: notificationService.scheduleReminderNotification.bind(notificationService),
    setBadgeCount: notificationService.setBadgeCount.bind(notificationService),
    clearBadge: notificationService.clearBadge.bind(notificationService),
  };
};

export default notificationService;
