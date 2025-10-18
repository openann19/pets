/**
 * Mock for react-native module
 * Provides basic implementations for React Native components and APIs used in tests
 */

export const Platform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
};

export const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export const StyleSheet = {
  create: jest.fn((styles) => styles),
  flatten: jest.fn((style) => style),
  absoluteFill: {},
  absoluteFillObject: {},
  hairlineWidth: 1,
};

export const View = 'View';
export const Text = 'Text';
export const ScrollView = 'ScrollView';
export const TouchableOpacity = 'TouchableOpacity';
export const TouchableHighlight = 'TouchableHighlight';
export const TouchableWithoutFeedback = 'TouchableWithoutFeedback';
export const TextInput = 'TextInput';
export const Image = 'Image';
export const FlatList = 'FlatList';
export const SectionList = 'SectionList';
export const ActivityIndicator = 'ActivityIndicator';
export const Alert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

export const Animated = {
  View: 'Animated.View',
  Text: 'Animated.Text',
  Image: 'Animated.Image',
  ScrollView: 'Animated.ScrollView',
  FlatList: 'Animated.FlatList',
  Value: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    stopAnimation: jest.fn(),
    interpolate: jest.fn(),
  })),
  timing: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
  spring: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
  sequence: jest.fn(),
  parallel: jest.fn(),
  stagger: jest.fn(),
  loop: jest.fn(),
  delay: jest.fn(),
  createAnimatedComponent: jest.fn((component) => component),
};

export const Linking = {
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getInitialURL: jest.fn(),
};

export const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export const NetInfo = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
};

export const Keyboard = {
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
};

export const StatusBar = {
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setHidden: jest.fn(),
  setTranslucent: jest.fn(),
};

export const SafeAreaView = 'SafeAreaView';

export const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
  roundToNearestPixel: jest.fn((size) => Math.round(size)),
};

export const DeviceInfo = {
  getModel: jest.fn(() => 'iPhone'),
  getSystemVersion: jest.fn(() => '16.0'),
  getBrand: jest.fn(() => 'Apple'),
  getDeviceId: jest.fn(() => 'test-device-id'),
};

export default {
  Platform,
  Dimensions,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  FlatList,
  SectionList,
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  AppState,
  NetInfo,
  Keyboard,
  StatusBar,
  SafeAreaView,
  PixelRatio,
  DeviceInfo,
};