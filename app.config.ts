const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    owner: 'sanich123',
    name: IS_DEV ? 'runich(dev)' : 'runich',
    slug: 'running-app',
    scheme: IS_DEV ? 'runich-dev' : 'runich',
    version: '1.2.2',
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
      reactCompiler: true,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      entitlements: {
        'com.apple.developer.networking.wifi-info': true,
        'com.apple.developer.healthkit': true,
      },
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
          'Приложению Runich нужен доступ к геолокации в фоне, чтобы продолжать запись активной тренировки при заблокированном экране или свернутом приложении. Вне тренировки геолокация в фоне не используется.',
        NSLocationWhenInUseUsageDescription:
          'Приложению Runich нужен доступ к геолокации во время использования для записи активной тренировки. Вне тренировки геолокация не используется.',
        NSMotionUsageDescription:
          'Приложение Runich использует данные о движении и шагах для определения активности и подсчета шагов во время тренировки',
        NSHealthShareUsageDescription:
          'Runich использует завершенные тренировки из Apple Health, чтобы сохранить их в вашем аккаунте',
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
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'runich.netlify.app',
              pathPrefix: '/activity',
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
              pathPrefix: '/activity',
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
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.ACTIVITY_RECOGNITION',
        'android.permission.health.READ_EXERCISE',
        'android.permission.health.READ_EXERCISE_ROUTES',
        'android.permission.health.READ_DISTANCE',
        'android.permission.health.READ_STEPS',
        'ACCESS_BACKGROUND_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
      blockedPermissions: [
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
        'android.permission.READ_MEDIA_AUDIO',
        'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
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
      'react-native-health-connect',
      'react-native-compressor',
      'expo-status-bar',
      'expo-image',
      'expo-sharing',
      'expo-router',
      'expo-font',
      'expo-video',
      'expo-secure-store',
      '@react-native-vector-icons/material-design-icons',
      [
        'expo-sensors',
        {
          motionPermission:
            'Разрешите приложению Runich доступ к данным движения и шагам для определения активности и подсчёта шагов во время тренировки',
        },
      ],
      '@rnmapbox/maps',
      [
        'expo-secure-store',
        { faceIDPermission: 'Разрешите приложению Runich использовать Face ID для защиты данных приложения' },
      ],
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 26,
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
            'Для добавления фото и видео к тренировке разрешите приложению Runich доступ к медиатеке устройства',
          microphonePermission: false,
        },
      ],
      [
        'expo-location',
        {
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
          isIosBackgroundLocationEnabled: true,
          locationAlwaysAndWhenInUsePermission:
            'Разрешите приложению Runich использовать геолокацию в фоне. Доступ нужен, чтобы продолжать запись активной тренировки при заблокированном экране или свернутом приложении. Вне тренировки геолокация в фоне не используется.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Приложению Runich нужен доступ к камере, чтобы делать фотографии для тренировок',
          recordAudioAndroid: false,
          barcodeScannerEnabled: false,
        },
      ],
      [
        'expo-media-library',
        {
          photosPermission: false,
          savePhotosPermission: 'Разрешите приложению Runich сохранять фотографии тренировок в галерею устройства',
          granularPermissions: [],
          isAccessMediaLocationEnabled: false,
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
