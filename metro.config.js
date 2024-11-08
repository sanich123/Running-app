/* eslint-env node */
const { getDefaultConfig } = require('@expo/metro-config');

// eslint-disable-next-line no-undef
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    (platform === 'web' &&
      (moduleName === '@rnmapbox/maps' ||
        moduleName === '@react-native-google-signin/google-signin' ||
        moduleName === 'react-native-pager-view' ||
        moduleName === 'expo-video-thumbnails' ||
        moduleName === 'react-native-zip-archive')) ||
    (platform !== 'web' && moduleName === 'mapbox-gl')
  ) {
    return {
      type: 'empty',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = defaultConfig;
