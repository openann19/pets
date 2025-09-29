module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript'
    ],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-transform-typescript'
    ],
  };
};
