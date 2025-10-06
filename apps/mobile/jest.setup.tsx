// Jest setup for React Native testing
import type React from 'react';

// Mock React Native before any other imports
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
  Dimensions: {
    get: jest.fn((dimension) => {
      if (dimension === 'window') {
        return { width: 375, height: 812 };
      }
      return { width: 375, height: 812 };
    }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  StatusBar: {
    currentHeight: 44,
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((styles) => styles),
    compose: jest.fn((styles) => styles),
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: jest.fn(),
    timing: jest.fn(),
    spring: jest.fn(),
    sequence: jest.fn(),
    parallel: jest.fn(),
    loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  },
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  UIManager: {
    setLayoutAnimationEnabledExperimental: jest.fn(),
  },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock react-native-webrtc
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn(),
  RTCIceCandidate: jest.fn(),
  RTCSessionDescription: jest.fn(),
  RTCView: 'RTCView',
  mediaDevices: {
    getUserMedia: jest.fn(),
  },
}));

// Mock InCallManager
jest.mock('react-native-incall-manager', () => {
  const mockInCallManager = {
    setSpeakerphoneOn: jest.fn(),
    setKeepScreenOn: jest.fn(),
    setForceSpeakerphoneOn: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    displayIncomingCall: jest.fn(),
    getSpeakerphoneOn: jest.fn(() => false),
    setMicrophoneMute: jest.fn(),
    turnScreenOn: jest.fn(),
    turnScreenOff: jest.fn(),
    setWiredHeadsetHfpOn: jest.fn(),
    setBluetoothScoOn: jest.fn(),
    setBluetoothScoOff: jest.fn(),
  };
  
  return mockInCallManager;
});

// Mock Socket.IO
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  })),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }: { children?: React.ReactNode }) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children?: React.ReactNode }) => children,
    Screen: ({ children }: { children?: React.ReactNode }) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children?: React.ReactNode }) => children,
    Screen: ({ children }: { children?: React.ReactNode }) => children,
  }),
}));

// Mock @pawfectmatch/core
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Test User', firstName: 'Test' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    initializeAuth: jest.fn(),
  }),
}));

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children?: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children?: React.ReactNode }) => children,
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

// Mock Theme Context
jest.mock('./src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    themeMode: 'light',
    colors: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      accent: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      white: '#ffffff',
      black: '#000000',
      gray50: '#f9fafb',
      gray100: '#f3f4f6',
      gray200: '#e5e7eb',
      gray300: '#d1d5db',
      gray400: '#9ca3af',
      gray500: '#6b7280',
      gray600: '#4b5563',
      gray700: '#374151',
      gray800: '#1f2937',
      gray900: '#111827',
    },
    styles: {},
    shadows: {},
    setThemeMode: jest.fn(),
    toggleTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children?: React.ReactNode }) => children,
}));

// Mock Theme Toggle Component
jest.mock('./src/components/ThemeToggle', () => 'ThemeToggle');

// Global test setup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.__DEV__ = true;

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');


// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
