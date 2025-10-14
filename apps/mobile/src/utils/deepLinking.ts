import React from 'react';
import { Linking } from 'react-native';
import { logger } from '../services/logger';

/**
 * Deep Linking Service for PawfectMatch Mobile
 * Professional implementation with comprehensive URL handling
 */

export interface DeepLinkData {
  type: 'pet' | 'match' | 'chat' | 'profile' | 'premium';
  id: string;
  action?: string | undefined;
  params: Record<string, string>;
}

/**
 * Parse a deep link URL into structured data
 * @param url The URL to parse
 */
export function parseDeepLink(url: string): DeepLinkData {
  try {
    // Create URL object for easy parsing
    const urlObj = new URL(url);

    // Extract path segments and remove empty ones
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);

    // Extract type and ID from path segments
    const type = pathSegments[0] as DeepLinkData['type'] || 'profile';
    const id = pathSegments[1] || '';
    const action = pathSegments[2];

    // Extract query parameters
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return {
      type,
      id,
      action,
      params,
    };
  } catch (error) {
    logger.error('Error parsing deep link', { url, error });

    // Return default values if parsing fails
    return {
      type: 'profile',
      id: '',
      params: {},
    };
  }
}

export class DeepLinkingService {
  private static instance: DeepLinkingService;
  private listeners = new Set<(data: DeepLinkData) => void>();
  private navigator: { navigate: (routeName: string, params?: Record<string, unknown>) => void } | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Handle initial URL if app was opened from a link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await this.handleUrl(initialUrl);
      }

      // Listen for incoming URLs
      Linking.addEventListener('url', this.handleUrlEvent);
    } catch (error) {
      logger.error('Error initializing deep linking:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  private handleUrlEvent = (event: { url: string }): void => {
    this.handleUrl(event.url).catch((error) => {
      logger.error('Error handling deep link URL event:', { error: error instanceof Error ? error.message : String(error) });
    });
  };

  async handleUrl(url: string): Promise<DeepLinkData | null> {
    try {
      logger.info('Handling deep link URL:', { url });

      const parsedData = this.parseUrl(url);
      if (parsedData) {
        await this.navigateToScreen(parsedData);
        this.notifyListeners(parsedData);
        return parsedData;
      }

      return null;
    } catch (error) {
      logger.error('Error handling URL:', { error: error instanceof Error ? error.message : String(error), url });
      return null;
    }
  }

  private parseUrl(url: string): DeepLinkData | null {
    try {
      // Handle pawfectmatch:// scheme
      if (url.startsWith('pawfectmatch://')) {
        return this.parseCustomScheme(url);
      }

      // Handle https://pawfectmatch.com scheme
      if (url.includes('pawfectmatch.com')) {
        return this.parseWebUrl(url);
      }

      return null;
    } catch (error) {
      logger.error('Error parsing URL:', { error: error instanceof Error ? error.message : String(error), url });
      return null;
    }
  }

  private parseCustomScheme(url: string): DeepLinkData | null {
    const path = url.replace('pawfectmatch://', '');
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) return null;

    const type = parts[0] as DeepLinkData['type'];
    const id = parts[1] || '';
    const params = this.extractParams(url);

    return { type, id, params };
  }

  private parseWebUrl(url: string): DeepLinkData | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const parts = path.split('/').filter(Boolean);

      if (parts.length === 0) return null;

      // Map web paths to app screens
      const pathMap: Record<string, DeepLinkData['type']> = {
        'pet': 'pet',
        'match': 'match',
        'chat': 'chat',
        'profile': 'profile',
        'premium': 'premium',
        'pets': 'pet',
        'matches': 'match',
        'messages': 'chat',
        'users': 'profile',
        'subscription': 'premium'
      };

      const type = pathMap[parts[0] ?? ''];
      const id = parts[1] || '';

      // Convert URLSearchParams to object manually
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      if (!type) return null;

      return { type, id, params };
    } catch (error) {
      logger.error('Error parsing web URL:', { error: error instanceof Error ? error.message : String(error), url });
      return null;
    }
  }

  private extractParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const queryString = url.split('?')[1];

    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }

    return params;
  }

  private async navigateToScreen(data: DeepLinkData): Promise<void> {
    // This would integrate with your navigation system
    // For now, we'll log the navigation intent
    logger.info('Deep link navigation:', { data });

    // Handle notification-based deep linking
    if (data.type === 'chat' && data.id) {
      // Navigate to specific chat
      await this.navigateToChat(data.id);
    } else if (data.type === 'pet' && data.id) {
      // Navigate to pet profile
      await this.navigateToPetProfile(data.id);
    } else if (data.type === 'match' && data.id) {
      // Navigate to match details
      await this.navigateToMatch(data.id);
    } else if (data.type === 'profile' && data.id) {
      // Navigate to user profile
      await this.navigateToUserProfile(data.id);
    } else if (data.type === 'premium') {
      // Navigate to premium screen
      await this.navigateToPremium();
    }
  }

  // Allow app root to inject navigator (e.g., from NavigationContainer)
  setNavigator(navigator: { navigate: (routeName: string, params?: Record<string, unknown>) => void }): void {
    this.navigator = navigator;
  }

  private async navigateToChat(matchId: string): Promise<void> {
    if (this.navigator !== null && this.navigator !== undefined) {
      this.navigator.navigate('Chat', { matchId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to chat:', { matchId });
  }

  private async navigateToPetProfile(petId: string): Promise<void> {
    if (this.navigator !== null && this.navigator !== undefined) {
      this.navigator.navigate('PetProfile', { petId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to pet profile:', { petId });
  }

  private async navigateToMatch(matchId: string): Promise<void> {
    if (this.navigator !== null && this.navigator !== undefined) {
      this.navigator.navigate('MatchDetails', { matchId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to match:', { matchId });
  }

  private async navigateToUserProfile(userId: string): Promise<void> {
    if (this.navigator !== null && this.navigator !== undefined) {
      this.navigator.navigate('UserProfile', { userId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to user profile:', { userId });
  }

  private async navigateToPremium(): Promise<void> {
    if (this.navigator !== null && this.navigator !== undefined) {
      this.navigator.navigate('Premium');
      return;
    }
    logger.warn('Navigator not available, cannot navigate to premium screen');
  }

  addListener(callback: (data: DeepLinkData) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(data: DeepLinkData): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in deep link listener:', { error: error instanceof Error ? error.message : String(error) });
      }
    });
  }

  async canOpenUrl(url: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      logger.error('Error checking if URL can be opened:', { error: error instanceof Error ? error.message : String(error), url });
      return false;
    }
  }

  async openUrl(url: string): Promise<void> {
    try {
      await Linking.openURL(url);
    } catch (error) {
      logger.error('Error opening URL:', { error: error instanceof Error ? error.message : String(error), url });
      throw error;
    }
  }

  cleanup(): void {
    // Note: In React Native, we don't need to manually remove the listener
    // as the addEventListener returns a subscription that should be removed
    // This is handled by the component using the service
    this.listeners.clear();
  }
}

// Export singleton instance
export const deepLinkingService = DeepLinkingService.getInstance();

// Utility hook for React components
export const useDeepLinking = () => {
  const [currentLink, setCurrentLink] = React.useState<DeepLinkData | null>(null);

  React.useEffect(() => {
    const unsubscribe = deepLinkingService.addListener((data) => {
      setCurrentLink(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    currentLink,
    handleUrl: deepLinkingService.handleUrl.bind(deepLinkingService),
    canOpenUrl: deepLinkingService.canOpenUrl.bind(deepLinkingService),
    openUrl: deepLinkingService.openUrl.bind(deepLinkingService),
    setNavigator: deepLinkingService.setNavigator.bind(deepLinkingService),
  };
};

export default deepLinkingService;
