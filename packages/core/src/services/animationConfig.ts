import type { AnimationConfig } from '../types/animations';
import { defaultAnimationConfig } from '../types/animations';


class AnimationConfigService {
  private config: AnimationConfig = { ...defaultAnimationConfig };
  private listeners: Set<(config: AnimationConfig) => void> = new Set();

  constructor() {
    this.loadConfig();
  }

  // Get current configuration
  getConfig(): AnimationConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.config = { ...defaultAnimationConfig };
    this.saveConfig();
    this.notifyListeners();
  }

  // Subscribe to configuration changes
  subscribe(listener: (config: AnimationConfig) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Check if animations are enabled globally
  areAnimationsEnabled(): boolean {
    return this.config.enabled;
  }

  // Check if a specific feature is enabled
  isFeatureEnabled(feature: keyof AnimationConfig): boolean {
    return this.config.enabled && Boolean(this.config[feature]);
  }

  // Get button animation config
  getButtonConfig() {
    return this.config.buttons;
  }

  // Get card animation config
  getCardConfig() {
    return this.config.cards;
  }

  // Get list animation config
  getListConfig() {
    return this.config.lists;
  }

  // Get celebration config
  getCelebrationConfig() {
    return this.config.celebrations;
  }

  // Get platform-specific config
  getMobileConfig() {
    return this.config.mobile;
  }

  getWebConfig() {
    return this.config.web;
  }

  private async loadConfig(): Promise<void> {
    try {
      // Load from localStorage (web) or AsyncStorage (mobile)
      const stored = this.getStorageItem('animation-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...defaultAnimationConfig, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load animation config:', error);
      this.config = { ...defaultAnimationConfig };
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      this.setStorageItem('animation-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save animation config:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getConfig());
      } catch (error) {
        console.warn('Error notifying animation config listener:', error);
      }
    });
  }

  // Platform-agnostic storage methods
  private getStorageItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    // For mobile, this would be handled by AsyncStorage in the mobile implementation
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    // For mobile, this would be handled by AsyncStorage in the mobile implementation
  }
}

// Singleton instance
export const animationConfig = new AnimationConfigService();

// React hook for using animation config
export function useAnimationConfig() {
  const [config, setConfig] = React.useState(animationConfig.getConfig());

  React.useEffect(() => {
    const unsubscribe = animationConfig.subscribe(setConfig);
    return unsubscribe;
  }, []);

  return config;
}

// Import React conditionally to avoid issues in non-React environments
let React: any;
try {
  React = require('react');
} catch {
  // Not in a React environment
}
