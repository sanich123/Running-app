export const STRAVA_DEVICE_COMPATIBILITY_URL =
  'https://support.strava.com/en-us/articles/16312772-what-devices-and-apps-are-compatible-with-strava';
export const STRAVA_COUNTRY_SUPPORT_URL =
  'https://support.strava.com/ru/articles/15401978-%D0%B4%D0%BE%D1%81%D1%82%D1%83%D0%BF%D0%BD%D0%BE-%D0%BB%D0%B8-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-strava-%D0%B2-%D0%BC%D0%BE%D0%B5%D0%B9-%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B5';
export const STRAVA_ANDROID_SUPPORT_URL =
  'https://support.strava.com/en-us/articles/15402019-supported-android-devices-and-android-operating-systems';
export const STRAVA_SIGN_UP_URL = 'https://www.strava.com/register';
export const STRAVA_XAPK_URL = 'https://strava.en.uptodown.com/android';
export const XAPK_INSTALL_GUIDE_URL = 'https://apkpure.net/how-to/how-to-install-xapk-apk';
export const APP_GALLERY_INSTALL_URL = 'https://appgallery1.huawei.com/#/app/C27162';
export const APP_GALLERY_URL = 'https://appgallery.huawei.com/';
export const HEALTH_SYNC_APP_GALLERY_URL = 'https://appgallery.huawei.com/app/C103198029';
export const HEALTH_SYNC_GUIDE_URL = 'https://healthsync.app/about/';
export const HEALTH_SYNC_FAQ_URL = 'https://healthsync.app/f-a-q/';
export const HMS_CORE_GUIDE_URL = 'https://consumer.huawei.com/en/support/content/en-us15841704/';
export const HEALTH_CONNECT_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
export const HEALTH_CONNECT_GUIDE_URL = 'https://support.google.com/android/answer/12201227';
export const HEALTH_SYNC_SOURCE_SCREENSHOT_URL =
  'https://healthsync.app/wp-content/uploads/2023/09/Health-Sync-activity-source-apps.webp';
export const HEALTH_SYNC_CONFIG_SCREENSHOT_URL =
  'https://healthsync.app/wp-content/uploads/2023/09/Health-Sync-activity-source-configure.webp';

export const WATCH_IMPORT_COPY = {
  en: {
    title: 'Workout import',
    warning: {
      title: 'Warning: setup is complicated and currently unstable',
      description: 'The instructions may be incomplete and will change.',
    },
    steps: {
      stravaConnection: {
        title: 'Choose a workout source for Health Sync',
        description:
          'Use Health Sync to transfer workouts from the watch companion app directly to Health Connect. In Health Sync, choose the watch app as the source and Health Connect as the destination; Strava is not required for this route.\n\nThe direct route has limitations: support depends on the watch model and companion app, some metrics may be missing, and the GPS route may not be transferred. Test one workout in Health Connect before relying on this route.\n\nIf the direct route does not work or you want a more predictable setup, use Strava as an intermediary. It requires more steps, but this is the verified route: watch app → Strava → Health Sync → Health Connect.',
      },
      stravaInstall: {
        title: 'Strava: more verified, but more steps',
        description:
          'Open the watch companion app, find Connected apps or Services, choose Strava, then sign in and approve the connection. Most popular watch models and companion apps can sync workouts with Strava; once connected, syncing is usually automatic.\n\nIf you do not have an account, you can try creating one on Strava’s website. If Strava is unavailable in Google Play in Russia, you can download its XAPK from a third-party catalog.',
        compatibleWatches: 'Compatible devices and apps for Strava',
        actions: {
          createAccount: 'Create a Strava account',
          xapk: 'Strava XAPK download page',
          installXapk: 'How to install XAPK',
          countryRestrictions: 'Strava country restrictions',
          androidRequirements: 'Strava Android requirements',
        },
      },
      healthSyncInstall: {
        title: 'Configure Health Sync',
        description:
          'Install Huawei AppGallery, then find HMS Core and Health Sync in it. HMS Core is usually already installed on Huawei phones; on other phones, install or update it through AppGallery.\n\nOpen Health Connect, find Health Sync, and grant all available permissions under App permissions. Then, under Additional access permissions, enable every item, including background access, workout routes, and saved data.\n\nHealth Sync does not sync continuously: it checks for new workouts according to the sync interval selected in its settings. Choose an interval that suits you; checking every 15 minutes is usually unnecessary for workouts, so checking every 12 hours is often enough.',
        stabilityWarning:
          'This part is unstable. Health Sync sometimes synchronizes a workout from Strava normally, and sometimes does not without explanation. Sometimes only date-based selective synchronization works.',
        note: 'Health Sync is also available on Google Play, but users in Russia cannot pay for the license there. In Huawei AppGallery, it costs 600 ₽ as a one-time payment for a perpetual license.\n\nFirst try the one-week free trial to make sure the service fits your needs, and only then pay for it.',
        actions: {
          installAppGallery: 'Install Huawei AppGallery',
          healthSyncAppGallery: 'Open Health Sync in AppGallery',
          findHmsCore: 'Find HMS Core in AppGallery',
          hmsCoreGuide: 'Huawei HMS Core instructions',
          healthSyncHelp: 'Health Sync help and license',
        },
      },
      healthConnect: {
        title: 'Configure Runich in Health Connect',
        description:
          'Use the Google Play button below to open or install Health Connect. If it is already installed on your device, you do not need to install anything—just tap “Open”.\n\nAfter tapping “Give access”, allow Runich every permission it requests in Health Connect: workouts, distance, steps, and workout routes.',
        note: 'Runich needs permissions for workout and route data to import activities. Health Connect grants these separately for each app.\n\nWe also recommend setting Health Connect to automatically delete data after three months.',
        actions: {
          grantAccess: 'Give access',
          accessGranted: 'Access granted',
          accessDenied: 'Workout access was not granted.',
          accessError: 'Could not connect Runich to Health Connect.',
          openPlayStore: 'Open Health Connect in Google Play',
          setupGuide: 'Health Connect setup guide',
        },
      },
      finish: {
        title: 'Check the Runich connection',
        description:
          'After you tap the button, a diagnostic page will open. It shows which workouts were found, which permissions Runich has, whether Health Connect is available, and other connection details.',
        action: 'Open diagnostic page',
      },
    },
    screenshots: {
      title: 'Health Sync screen examples',
      description: 'These screenshots come from the developer’s help pages.',
      sourceLabel: 'Health Sync source selection screen',
      configLabel: 'Health Sync sync configuration screen',
      documentation: 'Health Sync documentation',
    },
  },
  ru: {
    title: 'Импорт тренировок',
    warning: {
      title: 'Предупреждение: настройка непростая и пока работает нестабильно',
      description: 'Инструкция может быть неполной и будет изменяться.',
    },
    steps: {
      stravaConnection: {
        title: 'Выберите источник для Health Sync',
        description:
          'Используйте Health Sync, чтобы передавать тренировки из приложения часов напрямую в Health Connect. В Health Sync выберите приложение часов источником, а Health Connect назначением — для этого варианта Strava не нужна.\n\nУ прямого варианта есть ограничения: поддержка зависит от модели часов и приложения производителя, часть показателей может отсутствовать, GPS-маршрут может не передаться. Перед постоянным использованием проверьте одну тренировку в Health Connect.\n\nЕсли прямой вариант не работает или нужен более предсказуемый сценарий, используйте Strava как промежуточный сервис. Это требует больше шагов, но такой путь проверен: приложение часов → Strava → Health Sync → Health Connect.',
      },
      stravaInstall: {
        title: 'Strava: более проверенный вариант',
        description:
          'Откройте приложение производителя часов, найдите раздел подключённых приложений или сервисов, выберите Strava, войдите в аккаунт и подтвердите подключение. Большинство популярных моделей часов и приложений умеют передавать тренировки в Strava; после подключения синхронизация обычно работает автоматически.\n\nЕсли аккаунта ещё нет, его можно попробовать создать на сайте Strava. Если Strava не удаётся скачать из Google Play в России, можно загрузить XAPK из стороннего каталога.',
        compatibleWatches: 'Совместимые устройства и приложения со Strava',
        actions: {
          createAccount: 'Создать аккаунт Strava',
          xapk: 'Страница Strava с XAPK',
          installXapk: 'Как установить XAPK',
          countryRestrictions: 'Ограничения Strava по странам',
          androidRequirements: 'Требования Strava к Android',
        },
      },
      healthSyncInstall: {
        title: 'Настройте Health Sync',
        description:
          'Установите Huawei AppGallery, затем найдите в ней HMS Core и Health Sync. На телефоне Huawei HMS Core обычно уже установлен; на других телефонах установите или обновите его через AppGallery.\n\nОткройте Health Connect, найдите Health Sync и в разделе «Доступ приложений» разрешите все доступные пункты. Затем в разделе «Дополнительные права доступа» включите все пункты, включая фоновый режим, маршруты тренировок и сохранённые данные.\n\nHealth Sync не синхронизирует данные непрерывно: приложение проверяет новые тренировки по выбранному в настройках интервалу (таймауту). Выберите интервал, который вам подходит: проверять каждые 15 минут обычно не нужно, для тренировок чаще всего достаточно проверки раз в 12 часов.',
        stabilityWarning:
          'Эта часть работает нестабильно. Health Sync то нормально синхронизирует тренировку из Strava, то без объяснения причин не делает этого. Иногда работает только выборочная синхронизация по дате.',
        note: 'Health Sync также доступен в Google Play, но пользователи из России не смогут оплатить лицензию через этот магазин. В Huawei AppGallery приложение стоит 600 ₽ единоразово, лицензия действует бессрочно.\n\nСначала попробуйте недельный пробный период, чтобы проверить, подходит ли сервис, и только потом оплачивайте его.',
        actions: {
          installAppGallery: 'Установить Huawei AppGallery',
          healthSyncAppGallery: 'Открыть Health Sync в AppGallery',
          findHmsCore: 'Найти HMS Core в AppGallery',
          hmsCoreGuide: 'Инструкция Huawei по HMS Core',
          healthSyncHelp: 'Справка Health Sync и оплата',
        },
      },
      healthConnect: {
        title: 'Настройте Runich в Health Connect',
        description:
          'Нажмите кнопку Google Play ниже, чтобы открыть Health Connect и при необходимости установить приложение. Если Health Connect уже есть в системе, устанавливать ничего не нужно — просто нажмите «Открыть».\n\nПосле нажатия «Дать доступ» разрешите Runich все запрошенные разрешения в Health Connect: тренировки, расстояние, шаги и маршруты тренировок.',
        note: 'Для импорта Runich нужны разрешения на данные тренировок и маршрута. Они выдаются отдельно для каждого приложения в Health Connect.\n\nТакже рекомендуем включить автоматическое удаление данных из Health Connect через 3 месяца.',
        actions: {
          grantAccess: 'Дать доступ',
          accessGranted: 'Доступ предоставлен',
          accessDenied: 'Доступ к тренировкам не предоставлен.',
          accessError: 'Не удалось подключить Runich к Health Connect.',
          openPlayStore: 'Открыть Health Connect в Google Play',
          setupGuide: 'Как открыть и настроить Health Connect',
        },
      },
      finish: {
        title: 'Проверьте подключение Runich',
        description:
          'После нажатия на кнопку откроется диагностическая страница. На ней можно посмотреть, какие тренировки найдены, какие разрешения выданы Runich, доступен ли Health Connect и другую информацию о подключении.',
        action: 'Открыть диагностическую страницу',
      },
    },
    screenshots: {
      title: 'Примеры экранов Health Sync',
      description: 'Это скриншоты из справки разработчика.',
      sourceLabel: 'Экран выбора источника Health Sync',
      configLabel: 'Экран настройки синхронизации Health Sync',
      documentation: 'Документация Health Sync',
    },
  },
} as const;
