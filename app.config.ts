const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    owner: 'sanich123',
    name: IS_DEV ? 'runich(dev)' : 'runich',
    slug: 'running-app',
    scheme: 'runich',
    version: '4.0.1',
    orientation: 'portrait',
    runtimeVersion: { policy: 'appVersion' },
    icon: IS_DEV ? './assets/images/icon-dev.png' : './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#292929',
    },
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      // associatedDomains: ['applinks:runich.expo.app'],
      entitlements: { 'com.apple.developer.networking.wifi-info': true },
      config: { usesNonExemptEncryption: false },
      infoPlist: {
        UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ['runich'],
          },
        ],
        privacyManifests: {
          NSPrivacyAccessedAPITypes: [
            {
              NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
              NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
            },
          ],
        },
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Приложению Runich нужен доступ к данным геолокации в фоне все время для отслеживания тренировок',
        NSLocationWhenInUseUsageDescription:
          'Приложению Runich нужен доступ к данным геолокации для отслеживания тренировок',
        NSMotionUsageDescription:
          'Приложение Runich использует даннные о смене типа активности (ходьба, бег) для улучшения отслеживания тренировок',
      },
      bundleIdentifier: IS_DEV ? 'com.sanich123.runningapp.dev' : 'com.sanich123.runningapp',
    },
    android: {
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'runich.expo.app',
              pathPrefix: '/sign-in',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#333333',
      },
      package: IS_DEV ? 'com.sanich123.runningapp.dev' : 'com.sanich123.runningapp',
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'ACCESS_BACKGROUND_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
      softwareKeyboardLayoutMode: 'pan',
      usesCleartextTraffic: IS_DEV,
    },
    web: {
      bundler: 'metro',
      favicon: './assets/images/favicon.png',
      output: 'single',
    },
    extra: { eas: { projectId: '413aa829-bbae-467c-9201-4688b894f2f7' } },
    plugins: [
      './custom.plugin',
      'react-native-compressor',
      'expo-image',
      'expo-sharing',
      'expo-router',
      'expo-font',
      'expo-video',
      'expo-secure-store',
      '@rnmapbox/maps',
      ['expo-secure-store', { faceIDPermission: 'Разрешите приложению runich доступ к биометрическим данным FaceId ' }],
      [
        'expo-build-properties',
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
          ios: { ccacheEnabled: true },
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Для добавления фото к тренировке необходимо дать разрешение на доступ к галерее устройства',
        },
      ],
      [
        'expo-location',
        {
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
          isIosBackgroundLocationEnabled: true,
          locationAlwaysAndWhenInUsePermission:
            'Разрешите приложению Runich использовать данные о местоположении в фоне все время. Это необходимо для записи тренировок. ',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Разрешите приложению Runich доступ к камере телефона',
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
      [
        'react-native-edge-to-edge',
        { android: { parentTheme: 'Material3.Dynamic' }, enforceNavigationBarContrast: false },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#292929',
          image: './assets/images/splash.png',
          resizeMode: 'contain',
          imageWidth: 350,
        },
      ],
    ],
    updates: { url: 'https://u.expo.dev/413aa829-bbae-467c-9201-4688b894f2f7' },
  },
};
