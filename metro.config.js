const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@react-native-vector-icons/material-design-icons') {
    return context.resolveRequest(context, `${moduleName}/static`, platform);
  }

  if (
    (platform === 'web' &&
      [
        '@rnmapbox/maps',
        'react-native-pager-view',
        'expo-video-thumbnails',
        'react-native-zip-archive',
        'react-native-compressor',
        'react-native-battery-optimization-check',
        'react-native-nitro-modules',
        'expo-media-library',
        'expo-vpn-checker',
      ].includes(moduleName)) ||
    (platform !== 'web' && moduleName === 'mapbox-gl')
  ) {
    return {
      type: 'empty',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = defaultConfig;
