// Jest setup for React Native testing
// Mock TurboModuleRegistry first to prevent SettingsManager errors
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn((name) => {
    const mocks = {
      SettingsManager: {
        getSettings: jest.fn(() => ({})),
      },
      SoundManager: {
        playTouchSound: jest.fn(),
      },
      ModalManager: {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
      FrameRateLogger: {
        setGlobalOptions: jest.fn(),
        setContext: jest.fn(),
        beginScroll: jest.fn(),
        endScroll: jest.fn(),
      },
      ActionSheetManager: {
        showActionSheetWithOptions: jest.fn(),
        showShareActionSheetWithOptions: jest.fn(),
      },
      Appearance: {
        getColorScheme: jest.fn(() => 'light'),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
      RedBox: {
        install: jest.fn(),
        uninstall: jest.fn(),
      },
      BugReporting: {
        setExtraData: jest.fn(),
        reportException: jest.fn(),
      },
      NativePerformanceCxx: {
        mark: jest.fn(),
        measure: jest.fn(),
      },
      HeadlessJsTaskSupport: {
        notifyTaskFinished: jest.fn(),
        notifyTaskRetry: jest.fn(),
      },
      LogBox: {
        install: jest.fn(),
        uninstall: jest.fn(),
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
      },
      DialogManagerAndroid: {
        showAlert: jest.fn(),
      },
      PermissionsAndroid: {
        request: jest.fn(),
        requestMultiple: jest.fn(),
        check: jest.fn(),
      },
    };
    return mocks[name] || {};
  }),
  get: jest.fn(() => null),
}));

// Mock NativeDeviceInfo
jest.mock('react-native/Libraries/Utilities/NativeDeviceInfo', () => ({
  default: {
    getConstants: jest.fn(() => ({
      Dimensions: { window: { width: 375, height: 812 } },
      isIPhoneX_deprecated: false,
    })),
  },
}));

// Mock NativePlatformConstantsIOS
jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsIOS', () => ({
  default: {
    getConstants: jest.fn(() => ({
      isDisableAnimations: false,
      osVersion: '15.0',
      systemName: 'iOS',
    })),
  },
}));

// Mock Platform.ios to prevent getConstants errors
jest.mock('react-native/Libraries/Utilities/Platform.ios', () => ({
  default: {
    constants: {
      isDisableAnimations: false,
      osVersion: '15.0',
      systemName: 'iOS',
    },
  },
}));

// Mock gesture handler setup to prevent TurboModule errors
jest.mock('react-native-gesture-handler/jestSetup', () => ({}));

// Mock React Native
jest.mock('react-native', () => ({
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
      Version: 15,
    },
    StatusBar: {
      currentHeight: 44,
      setBarStyle: jest.fn(),
      setBackgroundColor: jest.fn(),
      setHidden: jest.fn(),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => styles),
      compose: jest.fn((styles) => styles),
      hairlineWidth: 1,
      absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
      absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    },
    Animated: {
      View: 'Animated.View',
      Text: 'Animated.Text',
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
        stop: jest.fn(),
        _isUsingNativeDriver: jest.fn(() => false),
      })),
      spring: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
        stop: jest.fn(),
        _isUsingNativeDriver: jest.fn(() => false),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
        stop: jest.fn(),
        _isUsingNativeDriver: jest.fn(() => false),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
        stop: jest.fn(),
        _isUsingNativeDriver: jest.fn(() => false),
      })),
      loop: jest.fn(() => ({ 
        start: jest.fn(), 
        stop: jest.fn(),
        _isUsingNativeDriver: jest.fn(() => false),
      })),
      delay: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
        stop: jest.fn(),
        _isUsingNativeDriver: jest.fn(() => false),
      })),
    },
    Alert: {
      alert: jest.fn(),
    },
    Vibration: {
      vibrate: jest.fn(),
      cancel: jest.fn(),
    },
    UIManager: {
      setLayoutAnimationEnabledExperimental: jest.fn(),
      measure: jest.fn(),
      measureInWindow: jest.fn(),
      measureLayout: jest.fn(),
    },
    InteractionManager: {
      runAfterInteractions: jest.fn((callback) => callback()),
      createInteractionHandle: jest.fn(() => 1),
      clearInteractionHandle: jest.fn(),
    },
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
      roundToNearestPixel: jest.fn((size) => size),
    },
}));

// Mock AsyncStorage - Fixed to prevent circular dependency
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockAsyncStorage = {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  };
  return {
    __esModule: true,
    default: mockAsyncStorage,
    ...mockAsyncStorage,
  };
});

// Mock react-native-reanimated - Enhanced mock
jest.mock('react-native-reanimated', () => {
  const mockReanimated = {
    default: {
      call: jest.fn(),
    },
    useSharedValue: jest.fn((initialValue) => ({
      value: initialValue,
    })),
    useAnimatedStyle: jest.fn((styleFn) => styleFn()),
    useAnimatedGestureHandler: jest.fn((handlers) => handlers),
    withSpring: jest.fn((value, config) => value),
    withTiming: jest.fn((value, config) => value),
    withSequence: jest.fn((...animations) => animations[0]),
    withDelay: jest.fn((delay, animation) => animation),
    runOnJS: jest.fn((fn) => fn),
    interpolate: jest.fn((value, inputRange, outputRange) => outputRange[0]),
    Extrapolate: {
      CLAMP: 'clamp',
      EXTEND: 'extend',
      IDENTITY: 'identity',
    },
  };
  return mockReanimated;
});

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  SelectionFeedbackStyle: {
    Selection: 'selection',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [] })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [] })),
  MediaTypeOptions: {
    Images: 'Images',
  },
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
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
}));

// Mock FastImage
jest.mock('react-native-fast-image', () => ({
  __esModule: true,
  default: 'FastImage',
  priority: {
    low: 'low',
    normal: 'normal',
    high: 'high',
  },
  cacheControl: {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  },
}));

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  State: {
    BEGAN: 1,
    FAILED: 2,
    CANCELLED: 3,
    ACTIVE: 4,
    END: 5,
  },
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
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
      text: '#111827',
      textSecondary: '#6b7280',
      background: '#ffffff',
      card: '#f9fafb',
    },
    styles: {},
    shadows: {},
    setThemeMode: jest.fn(),
    toggleTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children?: React.ReactNode }) => children,
}));

// Mock API service
jest.mock('./src/services/api', () => ({
  api: {
    ai: {
      generateBio: jest.fn(),
      analyzePhotos: jest.fn(),
      analyzeCompatibility: jest.fn(),
      getCompatibility: jest.fn(),
    },
  },
}));

// Global test setup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.__DEV__ = true;

// Polyfill for clearImmediate in JSDOM environment
global.clearImmediate = global.clearImmediate || global.clearTimeout;
global.setImmediate = global.setImmediate || global.setTimeout;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};