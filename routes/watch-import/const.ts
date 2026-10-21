export const APP_GALLERY_INSTALL_URL = 'https://appgallery1.huawei.com/#/app/C27162';
export const APP_GALLERY_URL = 'https://appgallery.huawei.com/';
export const HEALTH_SYNC_APP_GALLERY_URL = 'https://appgallery.huawei.com/app/C103198029';
export const HEALTH_SYNC_GUIDE_URL = 'https://healthsync.app/about/';
export const HEALTH_SYNC_FAQ_URL = 'https://healthsync.app/f-a-q/';
export const HMS_CORE_GUIDE_URL = 'https://consumer.huawei.com/en/support/content/en-us15841704/';
export const HEALTH_CONNECT_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
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
    importMethods:
      'Workouts with routes can be imported in two ways: from Strava or from the watch app. In both cases, the import goes through Health Sync.',
    steps: {
      healthSyncInstall: {
        title: 'Configure Health Sync',
        description:
          'Health Sync can be installed from Google Play or Huawei AppGallery. If installed from Google Play, payment is unavailable to users in Russia. To install it from Huawei AppGallery (if your phone is not Huawei), install Huawei AppGallery and HMS Core.\n\n1. In Health Connect, open Health Sync under App permissions and grant all available permissions. Then, under Additional access permissions, enable every available item, including background access, workout routes, and saved data.\n\n2. In Health Sync, configure workout synchronization from your preferred source to Health Connect. You will need to authorize the source the workouts will be exported from.\nNot all apps support exporting workouts with routes. Strava and Suunto were tested; both can export workouts with routes. If Health Sync or the source app offers a separate heart-rate export option, enable it too. Support depends on the source app, so a workout can appear in Health Connect without its heart-rate samples.\n\n3. Based on my experience corresponding with Health Sync support about the service’s very poor reliability:\n\n3.1. When importing workouts from Strava, enable synchronization only while connected to a VPN. Otherwise, for users in Russia, something gets reset and synchronization works poorly.\n\n3.2. Remove all restrictions on Health Sync running in the background.\n\n3.3. Support also recommended restarting the phone, though I do not think that is the problem.\n\n4. Debugging: Open Health Connect and find Health Sync under App data. The Workouts item will appear there. Browse back and forth through the workouts to see which ones have synced. If a workout shows a route, it was exported with location data. Check the Heart rate data for measurements during that workout; seeing the workout alone does not confirm that heart rate was exported.\n\n5. Health Sync works however it wants. As an exception, I somehow managed to automatically export a workout recorded in Strava to Runich once. The rest of the time, automatic and manual sync both run, but nothing is exported. Support does respond, but mostly tells me to disable the phone’s battery optimizations and says everything will then work. Support also told me that workouts recorded in Strava through a watch app are not exported. I have the Suunto watch app connected, but neither manual nor automatic sync works reliably with it.\n\n6. The only thing that worked reliably was the “Resync selected day” option in Health Sync’s menu. At least with Suunto, this works reliably.\n\n7. I managed to pay for Health Sync in AppGallery; the lifetime license costs 600 ₽. However, the service is very unstable.',
        actions: {
          installAppGallery: 'Install Huawei AppGallery',
          healthSyncAppGallery: 'Open Health Sync in AppGallery',
          findHmsCore: 'Find HMS Core in AppGallery',
          hmsCoreGuide: 'Huawei HMS Core instructions',
          healthSyncHelp: 'Health Sync help and license',
        },
      },
      healthConnect: {
        title: 'Configure Runich',
        description:
          '1. Open Health Connect\n\n2. Grant Runich all requested permissions in Health Connect.\n\n3. In Health Connect, Runich must have the additional permission to read workout routes set to “Always”.',
        actions: {
          grantAccess: 'Give access',
          accessGranted: 'Access granted',
          accessDenied: 'Workout access was not granted.',
          accessError: 'Could not connect Runich to Health Connect.',
        },
      },
      finish: {
        title: 'Check the Runich connection',
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
    importMethods:
      'Импорт тренировок с маршрутом возможен 2мя способами: из Strava и из приложения часов. В обоих случаях импорт идет через приложение Health Sync.',
    steps: {
      healthSyncInstall: {
        title: 'Настройте Health Sync',
        description:
          'Установить Health Sync можно из Google Play и из Huawei AppGallery. В случае установки из Google Play оплата для пользователей из России будет недоступна. Для установки из Huawei AppGallery (если телефон не Huawei) необходимо установить Huawei AppGallery и HMS Core.\n\n1. В Health Connect откройте настройки доступа для приложения Health Sync и разрешите все доступные пункты в разделе «Доступ приложений». Затем в разделе «Дополнительные права доступа» включите все пункты, включая фоновый режим, маршруты тренировок и сохранённые данные.\n\n2. В приложении Health Sync настройте синхронизацию тренировок из желаемого источника в Health Connect. Для этого потребуется авторизовать источник, из которого будут выгружаться тренировки.\nНе все приложения поддерживают выгрузку тренировки с маршрутами. Тестировалось на Strava и Suunto — они могут выгружать тренировки с маршрутами. Если Health Sync или приложение-источник позволяет отдельно настроить выгрузку пульса, включите её. Поддержка зависит от приложения-источника: тренировка может появиться в Health Connect без измерений пульса.\n\n3. Исходя из моего опыта переписки с поддержкой Health Sync по поводу очень кривой работы сервиса:\n\n3.1. В случае импорта тренировок из Strava включите синхронизацию только при включённом VPN, иначе у пользователей из России что-то сбрасывается и синхронизация работает плохо.\n\n3.2. Снимите все ограничения на работу Health Sync в фоновом режиме.\n\n3.3. Поддержка также рекомендовала перезагружать телефон (но, по-моему, проблема не в этом).\n\n4. Как дебажить: зайдите в Health Connect и найдите Health Sync в разделе «Данные приложения». Там отобразится пункт «Тренировки». Листая список тренировок вперёд и назад, можно увидеть, что синхронизировано. Если у тренировки отображается маршрут, значит, она выгрузилась с геопозициями. В разделе «Пульс» проверьте наличие измерений за время тренировки: наличие самой тренировки не подтверждает, что пульс тоже выгрузился.\n\n5. Health Sync работает, как ему хочется. В порядке исключения у меня как-то получилось автоматически выгрузить записанную тренировку из Strava в Runich. Всё остальное время автоматическая и ручная синхронизация работают, но ничего не выгружается. Поддержка вроде отвечает, но в основном советует отключить оптимизацию батареи телефона — после этого, по их словам, всё заработает. От поддержки я узнал, что тренировки, записанные в Strava через приложение часов, не выгружаются. У меня подключено приложение часов Suunto, но ни ручная, ни автоматическая синхронизация с ним стабильно не работают.\n\n6. Единственное, что стабильно работало, — повторная синхронизация за выбранный день в меню Health Sync. По крайней мере, с Suunto этот способ работает стабильно.\n\n7. Мне удалось оплатить Health Sync в AppGallery — вечная лицензия стоит 600 ₽. Но сервис работает очень нестабильно.',
        actions: {
          installAppGallery: 'Установить Huawei AppGallery',
          healthSyncAppGallery: 'Открыть Health Sync в AppGallery',
          findHmsCore: 'Найти HMS Core в AppGallery',
          hmsCoreGuide: 'Инструкция Huawei по HMS Core',
          healthSyncHelp: 'Справка Health Sync и оплата',
        },
      },
      healthConnect: {
        title: 'Настройте Runich',
        description:
          '1. Откройте Health Connect\n\n2. Дайте Runich все запрошенные разрешения в Health Connect.\n\n3. Также у Runich должно быть включено дополнительное разрешение на чтение маршрутов с режимом «Всегда».',
        actions: {
          grantAccess: 'Дать доступ',
          accessGranted: 'Доступ предоставлен',
          accessDenied: 'Доступ к тренировкам не предоставлен.',
          accessError: 'Не удалось подключить Runich к Health Connect.',
        },
      },
      finish: {
        title: 'Проверьте подключение Runich',
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
