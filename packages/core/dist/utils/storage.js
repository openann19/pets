/**
 * Cross-platform storage utility for React Native and Web
 * Provides a unified interface for localStorage (web) and AsyncStorage (React Native)
 */
// Platform detection helpers
const isWeb = () => {
    return typeof window !== 'undefined' && 'localStorage' in window;
};
const isReactNative = () => {
    return !isWeb();
};
let AsyncStorage = null;
if (isReactNative()) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const AsyncStorageModule = require('@react-native-async-storage/async-storage');
        AsyncStorage = AsyncStorageModule.default;
    }
    catch (error) {
        console.warn('AsyncStorage not available, using memory storage fallback');
    }
}
// Memory storage fallback
const memoryStorage = new Map();
class CrossPlatformStorage {
    async getItem(key) {
        try {
            if (isReactNative() && AsyncStorage !== null) {
                return await AsyncStorage.getItem(key);
            }
            else if (isWeb()) {
                return window.localStorage.getItem(key);
            }
            else {
                return memoryStorage.get(key) ?? null;
            }
        }
        catch (error) {
            console.warn(`Failed to get item ${key}:`, error);
            return memoryStorage.get(key) ?? null;
        }
    }
    async setItem(key, value) {
        try {
            if (isReactNative() && AsyncStorage !== null) {
                await AsyncStorage.setItem(key, value);
            }
            else if (isWeb()) {
                window.localStorage.setItem(key, value);
            }
            else {
                memoryStorage.set(key, value);
            }
        }
        catch (error) {
            console.warn(`Failed to set item ${key}:`, error);
            memoryStorage.set(key, value);
        }
    }
    async removeItem(key) {
        try {
            if (isReactNative() && AsyncStorage !== null) {
                await AsyncStorage.removeItem(key);
            }
            else if (isWeb()) {
                window.localStorage.removeItem(key);
            }
            else {
                memoryStorage.delete(key);
            }
        }
        catch (error) {
            console.warn(`Failed to remove item ${key}:`, error);
            memoryStorage.delete(key);
        }
    }
    async clear() {
        try {
            if (isReactNative() && AsyncStorage !== null) {
                await AsyncStorage.clear();
            }
            else if (isWeb()) {
                window.localStorage.clear();
            }
            else {
                memoryStorage.clear();
            }
        }
        catch (error) {
            console.warn('Failed to clear storage:', error);
            memoryStorage.clear();
        }
    }
}
// Create singleton instance
export const storage = new CrossPlatformStorage();
// Synchronous fallback for immediate access (web only)
export const getItemSync = (key) => {
    try {
        if (isWeb()) {
            return window.localStorage.getItem(key);
        }
    }
    catch (error) {
        console.warn(`Failed to get item ${key} synchronously:`, error);
    }
    return memoryStorage.get(key) ?? null;
};
export const setItemSync = (key, value) => {
    try {
        if (isWeb()) {
            window.localStorage.setItem(key, value);
            return;
        }
    }
    catch (error) {
        console.warn(`Failed to set item ${key} synchronously:`, error);
    }
    memoryStorage.set(key, value);
};
export const removeItemSync = (key) => {
    try {
        if (isWeb()) {
            window.localStorage.removeItem(key);
            return;
        }
    }
    catch (error) {
        console.warn(`Failed to remove item ${key} synchronously:`, error);
    }
    memoryStorage.delete(key);
};
export default storage;
