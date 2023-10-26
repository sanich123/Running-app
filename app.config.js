const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: IS_DEV ? 'runich(dev)' : 'runich',
    slug: 'running-app',
    version: '1.0.10',
    orientation: 'portrait',
    icon: IS_DEV ? './assets/images/icon-dev.png' : './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#333333',
    },
    experiments: {
      typedRoutes: true,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      runtimeVersion: '1.0.10(10)',
      bundleIdentifier: IS_DEV ? 'com.myapp.dev' : 'com.myapp',
    },
    android: {
      versionCode: 10,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#333333',
      },
      package: IS_DEV ? 'com.sanich123.runningapp.dev' : 'com.sanich123.runningapp',
      permissions: [
        'android.permission.RECORD_AUDIO',
        'ACCESS_BACKGROUND_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
      runtimeVersion: '1.0.10(10)',
    },
    web: {
      bundler: 'metro',
      favicon: './assets/images/favicon.png',
    },
    extra: {
      eas: {
        projectId: '413aa829-bbae-467c-9201-4688b894f2f7',
      },
    },
    plugins: [
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsImpl: 'mapbox',
          RNMapboxMapsDownloadToken:
            'sk.eyJ1Ijoic2FuaWNoMTIzIiwiYSI6ImNsaWtvam9oazBrZjcza29kZ2hhMmtlcjEifQ.PkCRRfGrD8iiEOIBB9BLcg',
        },
      ],
      'expo-router',
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'Show current location on map.',
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
      'react-native-compressor',
    ],
    updates: {
      url: 'https://u.expo.dev/413aa829-bbae-467c-9201-4688b894f2f7',
    },
  },
};
