/**
 * Mock for react-native module
 * Provides basic implementations for React Native components and APIs used in tests
 */

const Platform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
};

const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const StyleSheet = {
  create: jest.fn((styles) => styles),
  flatten: jest.fn((style) => style),
  absoluteFill: {},
  absoluteFillObject: {},
  hairlineWidth: 1,
};

const View = 'View';
const Text = 'Text';
const ScrollView = 'ScrollView';
const TouchableOpacity = 'TouchableOpacity';
const TouchableHighlight = 'TouchableHighlight';
const TouchableWithoutFeedback = 'TouchableWithoutFeedback';
const TextInput = 'TextInput';
const Image = 'Image';
const FlatList = 'FlatList';
const SectionList = 'SectionList';
const ActivityIndicator = 'ActivityIndicator';
const Alert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

const Animated = {
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

const Linking = {
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getInitialURL: jest.fn(),
};

const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const NetInfo = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
};

const Keyboard = {
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
};

const StatusBar = {
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setHidden: jest.fn(),
  setTranslucent: jest.fn(),
};

const SafeAreaView = 'SafeAreaView';

const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
  roundToNearestPixel: jest.fn((size) => Math.round(size)),
};

const DeviceInfo = {
  getModel: jest.fn(() => 'iPhone'),
  getSystemVersion: jest.fn(() => '16.0'),
  getBrand: jest.fn(() => 'Apple'),
  getDeviceId: jest.fn(() => 'test-device-id'),
};

module.exports = {
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