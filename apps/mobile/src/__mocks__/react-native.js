// Mock React Native at the module level
const mockDimensions = {
  get: jest.fn((dimension) => {
    if (dimension === 'window') {
      return { width: 375, height: 812 };
    }
    return { width: 375, height: 812 };
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const mockStyleSheet = {
  create: jest.fn((styles) => {
    const styleObj = {};
    Object.keys(styles).forEach(key => {
      styleObj[key] = styles[key];
    });
    return styleObj;
  }),
  flatten: jest.fn((styles) => styles),
  compose: jest.fn((styles) => styles),
};

const mockAnimated = {
  View: 'Animated.View',
  Text: 'Animated.Text',
  Value: jest.fn().mockImplementation((value) => {
    const mockValue = {
      _value: value,
      setValue: jest.fn(),
      interpolate: jest.fn((config) => ({
        _config: config,
        _value: value,
      })),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    };
    return Object.assign(mockValue, jest.fn());
  }),
  timing: jest.fn(),
  spring: jest.fn(),
  sequence: jest.fn(),
  parallel: jest.fn(),
  stagger: jest.fn(),
  loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
};

const mockStatusBar = {
  currentHeight: 44,
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setHidden: jest.fn(),
  setTranslucent: jest.fn(),
};

const mockPlatform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
};

module.exports = {
  Dimensions: mockDimensions,
  StyleSheet: mockStyleSheet,
  Animated: mockAnimated,
  StatusBar: mockStatusBar,
  Platform: mockPlatform,
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  FlatList: 'FlatList',
  SectionList: 'SectionList',
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
  Settings: {
    get: jest.fn(() => Promise.resolve({})),
    set: jest.fn(() => Promise.resolve()),
    watchKeys: jest.fn(),
    clearWatch: jest.fn(),
  },
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => callback()),
    createInteractionHandle: jest.fn(),
    clearInteractionHandle: jest.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  BackHandler: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  PermissionsAndroid: {
    check: jest.fn(() => Promise.resolve(true)),
    request: jest.fn(() => Promise.resolve('granted')),
    requestMultiple: jest.fn(() => Promise.resolve({})),
    PERMISSIONS: {},
    RESULTS: {},
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
};
