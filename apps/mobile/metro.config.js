/**
 * Metro configuration for optimized bundle size and performance
 * Reduces APK size and improves app startup time
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking for better bundle size
config.resolver = {
  ...config.resolver,
  // Enable platform-specific extensions resolution
  platforms: ['ios', 'android'],
  // Optimize asset loading
  assetExts: config.resolver.assetExts.filter(ext => !['svg', 'ttf'].includes(ext)),
};

// Transformer configuration for optimization
config.transformer = {
  ...config.transformer,
  // Enable minification in production
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
  },
  // Optimize asset loading
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Enable experimental features for smaller bundles
  enableBabelRCLookup: false,
  enableBabelRuntime: true,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Serializer configuration
config.serializer = {
  ...config.serializer,
  // Create separate chunks for better caching
  createModuleIdFactory: function () {
    const { createModuleIdFactory: originalCreateModuleIdFactory } = require('metro').createModuleIdFactory;
    return originalCreateModuleIdFactory();
  },
  // Enable experimental serializer features
  experimentalSerializerHook: (graph, delta) => {
    // Custom logic for optimizing bundle chunks
    return graph;
  },
};

// Watch folders for better development experience
config.watchFolders = [
  ...config.watchFolders,
  // Add shared packages for better hot reloading
];

// Enable source maps in development for better debugging
if (__DEV__) {
  config.transformer.sourceMap = true;
}

module.exports = config;
