import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

/**
 * Secure storage adapter for Zustand persist middleware
 * Uses expo-secure-store instead of AsyncStorage for sensitive data like JWT tokens
 * Addresses M-SEC-01: JWT stored in AsyncStorage security vulnerability
 */
export const createSecureStorage = (): StateStorage => {
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        const value = await SecureStore.getItemAsync(name);
        return value;
      } catch (error) {
        console.error(`Error getting item ${name} from secure storage:`, error);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await SecureStore.setItemAsync(name, value);
      } catch (error) {
        console.error(`Error setting item ${name} in secure storage:`, error);
        throw error;
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await SecureStore.deleteItemAsync(name);
      } catch (error) {
        console.error(`Error removing item ${name} from secure storage:`, error);
        throw error;
      }
    },
  };
};

/**
 * Secure storage for non-sensitive data that can use AsyncStorage
 * Used for preferences, theme settings, etc.
 */
export const createAsyncStorage = (): StateStorage => {
  // Use require instead of dynamic import for React Native compatibility
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        const value = await AsyncStorage.getItem(name);
        return value;
      } catch (error) {
        console.error(`Error getting item ${name} from async storage:`, error);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(name, value);
      } catch (error) {
        console.error(`Error setting item ${name} in async storage:`, error);
        throw error;
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(name);
      } catch (error) {
        console.error(`Error removing item ${name} from async storage:`, error);
        throw error;
      }
    },
  };
};
