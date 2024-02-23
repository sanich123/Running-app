const { getDefaultConfig } = require('@expo/metro-config');

// eslint-disable-next-line no-undef
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    (platform === 'web' && moduleName === '@rnmapbox/maps') ||
    (platform !== 'web' && moduleName === 'mapbox-gl') ||
    (platform === 'web' && moduleName === '@react-native-google-signin/google-signin')
  ) {
    return {
      type: 'empty',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = defaultConfig;
