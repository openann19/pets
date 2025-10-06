/**
 * Cross-platform storage utility for React Native and Web
 * Provides a unified interface for localStorage (web) and AsyncStorage (React Native)
 */

// Platform detection helpers
const isWeb = (): boolean => {
  return typeof window !== 'undefined' && 'localStorage' in window;
};

const isReactNative = (): boolean => {
  return !isWeb();
};

// React Native storage implementation
interface AsyncStorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

let AsyncStorage: AsyncStorageInterface | null = null;
if (isReactNative()) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorageModule = require('@react-native-async-storage/async-storage') as { default: AsyncStorageInterface };
    AsyncStorage = AsyncStorageModule.default;
  } catch (error) {
    console.warn('AsyncStorage not available, using memory storage fallback');
  }
}

// Memory storage fallback
const memoryStorage = new Map<string, string>();

class CrossPlatformStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isReactNative() && AsyncStorage !== null) {
        return await AsyncStorage.getItem(key);
      } else if (isWeb()) {
        return window.localStorage.getItem(key);
      } else {
        return memoryStorage.get(key) ?? null;
      }
    } catch (error) {
      console.warn(`Failed to get item ${key}:`, error);
      return memoryStorage.get(key) ?? null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isReactNative() && AsyncStorage !== null) {
        await AsyncStorage.setItem(key, value);
      } else if (isWeb()) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage.set(key, value);
      }
    } catch (error) {
      console.warn(`Failed to set item ${key}:`, error);
      memoryStorage.set(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (isReactNative() && AsyncStorage !== null) {
        await AsyncStorage.removeItem(key);
      } else if (isWeb()) {
        window.localStorage.removeItem(key);
      } else {
        memoryStorage.delete(key);
      }
    } catch (error) {
      console.warn(`Failed to remove item ${key}:`, error);
      memoryStorage.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (isReactNative() && AsyncStorage !== null) {
        await AsyncStorage.clear();
      } else if (isWeb()) {
        window.localStorage.clear();
      } else {
        memoryStorage.clear();
      }
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      memoryStorage.clear();
    }
  }
}

// Create singleton instance
export const storage = new CrossPlatformStorage();

// Synchronous fallback for immediate access (web only)
export const getItemSync = (key: string): string | null => {
  try {
    if (isWeb()) {
      return window.localStorage.getItem(key);
    }
  } catch (error) {
    console.warn(`Failed to get item ${key} synchronously:`, error);
  }
  return memoryStorage.get(key) ?? null;
};

export const setItemSync = (key: string, value: string): void => {
  try {
    if (isWeb()) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (error) {
    console.warn(`Failed to set item ${key} synchronously:`, error);
  }
  memoryStorage.set(key, value);
};

export const removeItemSync = (key: string): void => {
  try {
    if (isWeb()) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (error) {
    console.warn(`Failed to remove item ${key} synchronously:`, error);
  }
  memoryStorage.delete(key);
};

export default storage;
