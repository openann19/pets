/**
 * Jest setup for apps/mobile
 * Provides comprehensive mocks for React Native and Expo modules
 * Production-hardened testing infrastructure
 */

import React from 'react';

// ===== JEST GLOBALS CONFIGURATION =====
// Configure Jest globals properly as per hardening plan
import 'react-native';

// Provide __DEV__ global for testing
(globalThis as any).__DEV__ = true;

// ===== MOCK IMPLEMENTATIONS =====

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
  setStatusBarStyle: jest.fn(),
  setStatusBarBackgroundColor: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoVersion: '49.0.0',
    nativeAppVersion: '1.0.0',
    nativeBuildVersion: '1',
    deviceName: 'iPhone',
    deviceYearClass: 2020,
    isDevice: true,
    osName: 'iOS',
    osVersion: '16.0',
    platform: {
      ios: { buildNumber: '1', model: 'iPhone', platform: 'ios', systemVersion: '16.0', userInterfaceIdiom: 'handset' },
    },
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone 14',
  modelId: 'iPhone14,1',
  designName: 'iPhone14,1',
  productName: 'iPhone14,1',
  deviceYearClass: 2020,
  totalMemory: 8 * 1024 * 1024 * 1024, // 8GB
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '16.0',
  osBuildId: '20A362',
  osInternalBuildId: '20A362',
  platformApiLevel: undefined,
  deviceType: 'phone',
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    DEFAULT: 'default',
    HIGH: 'high',
    LOW: 'low',
    MAX: 'max',
    MIN: 'min',
    NONE: 'none',
    UNSPECIFIED: 'unspecified',
  },
  AndroidVisibility: {
    PUBLIC: 'public',
    PRIVATE: 'private',
    SECRET: 'secret',
  },
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('test-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getBadgeCountAsync: jest.fn().mockResolvedValue(0),
  setBadgeCountAsync: jest.fn().mockResolvedValue(undefined),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[test-token]' }),
  createChannelAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  displayNotificationAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  getAllKeysAsync: jest.fn().mockResolvedValue([]),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn().mockResolvedValue({
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
    details: {
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      ssid: 'TestNetwork',
      bssid: '00:11:22:33:44:55',
      frequency: 2412,
      strength: 99,
    },
  }),
  useNetInfo: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
    name: 'TestScreen',
  }),
  useFocusEffect: jest.fn(),
}));

// Mock @pawfectmatch/core logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    security: jest.fn(),
    performance: jest.fn(),
  },
  api: {
    getPets: jest.fn().mockResolvedValue([]),
    getMatches: jest.fn().mockResolvedValue([]),
    getMessages: jest.fn().mockResolvedValue([]),
    sendMessage: jest.fn().mockResolvedValue({}),
    getUserProfile: jest.fn().mockResolvedValue({}),
    updateUserProfile: jest.fn().mockResolvedValue({}),
  },
}));

// ===== TEST ENVIRONMENT SETUP =====

// Set up test environment globals
beforeAll(() => {
  // Mock console methods to reduce noise during testing
  const originalConsole = { ...console };
  (globalThis as any).console = {
    ...originalConsole,
    // Keep error and warn for debugging test failures
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
(globalThis as any).testUtils = {
  flushPromises: () => new Promise<void>((resolve) => {
    const processNextTick = globalThis.process?.nextTick;
    if (processNextTick) {
      processNextTick(resolve);
    } else {
      setTimeout(resolve, 0);
    }
  }),
  waitForNextTick: () => new Promise<void>((resolve) => setTimeout(resolve, 0)),
};