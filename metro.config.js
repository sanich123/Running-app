const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const materialDesignIconsPackage = '@react-native-vector-icons/material-design-icons';
const webMaterialDesignIcons = path.resolve(__dirname, 'shared/icons/material-design-icons.web.ts');
defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && [materialDesignIconsPackage, `${materialDesignIconsPackage}/static`].includes(moduleName)) {
    return context.resolveRequest(context, webMaterialDesignIcons, platform);
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
