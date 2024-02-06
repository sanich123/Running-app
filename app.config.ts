const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: IS_DEV ? 'runich(dev)' : 'runich',
    slug: 'running-app',
    version: '2.0.0',
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
      tsconfigPaths: true,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      entitlements: {
        'com.apple.developer.networking.wifi-info': true,
      },
      infoPlist: {
        UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
      },
      supportsTablet: true,
      runtimeVersion: '2.0.0(17)',
      bundleIdentifier: IS_DEV ? 'com.myapp.dev' : 'com.myapp',
    },
    android: {
      versionCode: 17,
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
      runtimeVersion: '2.0.0(17)',
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
          RNMapboxMapsDownloadToken:
            'sk.eyJ1Ijoic2FuaWNoMTIzIiwiYSI6ImNsaWtvam9oazBrZjcza29kZ2hhMmtlcjEifQ.PkCRRfGrD8iiEOIBB9BLcg',
          RNMapboxMapsVersion: '11.0.0',
        },
      ],
      'expo-router',
      'expo-font',
      'expo-secure-store',
      [
        'expo-build-properties',
        {
          android: {
            useLegacyPackaging: true,
          },
        },
      ],
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
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera.',
        },
      ],
      [
        'expo-media-library',
        {
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
          savePhotosPermission: 'Allow $(PRODUCT_NAME) to save photos.',
          isAccessMediaLocationEnabled: true,
        },
      ],
    ],
    updates: {
      url: 'https://u.expo.dev/413aa829-bbae-467c-9201-4688b894f2f7',
    },
  },
};
