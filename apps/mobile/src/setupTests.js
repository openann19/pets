/* eslint-env jest */

// Mock console 
global.console = {
  ...console,
  // Suppress specific warnings during tests
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Mock Expo modules that aren't handled by jest-expo
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

// Mock react-native-reanimated with simple implementations
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const Text = require('react-native').Text;

  return {
    default: {
      View,
      Text,
      ScrollView: require('react-native').ScrollView,
      createAnimatedComponent: (component) => component,
    },
    View,
    Text,
    interpolate: jest.fn(),
    withSpring: jest.fn(value => value),
    withTiming: jest.fn(value => value),
    useSharedValue: jest.fn(() => ({ value: 0, setValue: jest.fn() })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useDerivedValue: jest.fn(() => ({ value: 0 })),
    runOnJS: jest.fn(fn => fn),
  };
});

// Mock expo-modules-core to avoid ES module issues
jest.mock('expo-modules-core', () => ({
  EventEmitter: jest.fn(),
  NativeModule: jest.fn(),
  SharedObject: jest.fn(),
  SharedRef: jest.fn(),
}), { virtual: true });

// Mock @expo/modules-core
jest.mock('@expo/modules-core', () => ({
  EventEmitter: jest.fn(),
  NativeModule: jest.fn(),
  SharedObject: jest.fn(),
  SharedRef: jest.fn(),
}), { virtual: true });

// Mock the specific problematic file
jest.mock('expo-modules-core/src/web/index.web.ts', () => ({
  EventEmitter: jest.fn(),
  NativeModule: jest.fn(),
  SharedObject: jest.fn(),
  SharedRef: jest.fn(),
}), { virtual: true });

// Extend jest with React Native Testing Library matchers
require('@testing-library/jest-native/extend-expect');