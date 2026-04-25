const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add buffer polyfill for react-native-svg
config.resolver.alias = {
  ...config.resolver.alias,
  buffer: require.resolve('buffer'),
};

// Ensure proper resolution order for web builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Handle platform-specific extensions properly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Ensure async-storage is handled properly on web
config.resolver.unstable_enablePackageExports = true;

module.exports = config;