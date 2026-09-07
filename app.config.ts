const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    owner: 'sanich123',
    name: IS_DEV ? 'runich(dev)' : 'runich',
    slug: 'running-app',
    scheme: IS_DEV ? 'runich-dev' : 'runich',
    version: '4.0.1',
    orientation: 'portrait',
    runtimeVersion: { policy: 'appVersion' },
    icon: IS_DEV ? './assets/images/icon-dev.png' : './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#363636',
    },
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      entitlements: { 'com.apple.developer.networking.wifi-info': true },
      config: { usesNonExemptEncryption: false },
      infoPlist: {
        UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
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
              host: 'runich.netlify.app',
              pathPrefix: '/login-from-url',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'stage--runich.netlify.app',
              pathPrefix: '/login-from-url',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#292929',
      },
      package: IS_DEV ? 'com.sanich123.runningapp.dev' : 'com.sanich123.runningapp',
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.ACTIVITY_RECOGNITION',
        'ACCESS_BACKGROUND_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
      softwareKeyboardLayoutMode: 'resize',
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
      [
        'expo-sensors',
        {
          motionPermission:
            'Разрешите приложению Runich доступ к данным движения для подсчёта шагов во время тренировки',
        },
      ],
      '@rnmapbox/maps',
      ['expo-secure-store', { faceIDPermission: 'Разрешите приложению runich доступ к биометрическим данным FaceId ' }],
      [
        'expo-build-properties',
        {
          android: {
            usePrecompiledHeaders: true,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            extraProguardRules: [
              '-keep class expo.modules.adapters.react.apploader.** { *; }',
              '-dontwarn com.google.mlkit.vision.barcode.**',
              '-dontwarn com.google.mlkit.vision.codescanner.**',
              '-dontwarn com.google.mlkit.vision.common.**',
            ].join('\n'),
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
          cameraPermission: 'Приложению необходим доступ к камере для создания отчета по транспортному средству',
          recordAudioAndroid: false,
          barcodeScannerEnabled: false,
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
          backgroundColor: '#363636',
          image: './assets/images/splash.png',
          resizeMode: 'contain',
          imageWidth: 350,
        },
      ],
    ],
    updates: { url: 'https://u.expo.dev/413aa829-bbae-467c-9201-4688b894f2f7' },
  },
};
