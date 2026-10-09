export const ROUTE_STATUS_LABELS = {
  'route-in-record': ['маршрут в записи', 'route in record'],
  'no-route-data': ['Health Connect сообщает: маршрута нет', 'Health Connect reports no route'],
  'route-not-provided': ['маршрут не предоставлен', 'route not provided'],
  'consent-granted': ['доступ выдан, точки получены', 'consent granted, points read'],
  'consent-granted-empty': ['доступ выдан, точек нет', 'consent granted, no points'],
  'consent-denied-or-error': ['отказ или ошибка доступа', 'consent denied or read failed'],
} as const;

export const READ_STAGE_LABELS = {
  availability: ['проверка Health Connect', 'checking Health Connect'],
  'exercise-sessions': ['чтение списка активностей', 'reading exercise sessions'],
  'distance-and-steps': ['чтение расстояния и шагов', 'reading distance and steps'],
  'exercise-route': ['запрос доступа к маршруту', 'requesting route access'],
  complete: ['чтение завершено', 'read complete'],
} as const;

export const UPLOAD_SKIP_REASON_LABELS = {
  'read-failed': ['чтение завершилось ошибкой', 'the health store read failed'],
  'no-user': ['аккаунт Runich не определён', 'Runich account is unavailable'],
  'no-workouts': ['не найдено тренировок для отправки', 'no workouts were found to upload'],
  'manual-selection': [
    'ожидается выбор тренировок для первого импорта',
    'waiting for workout selection on first import',
  ],
} as const;

export const WORKOUT_IMPORT_COPY = {
  ru: {
    title: 'Импорт тренировок',
    flow: 'Цепочка передачи: часы → приложение производителя → Strava → Health Sync → Health Connect → Runich. Runich читает данные из хранилища телефона, а не напрямую с часов.',
    appsTitle: 'Установите приложения',
    appsIntro:
      'Понадобятся приложение производителя часов, Strava, Health Sync и Health Connect. Health Sync для Android можно установить через AppGallery.',
    healthSyncInstall: 'Health Sync в AppGallery',
    healthSyncLicense: 'Установка и лицензия Health Sync',
    healthSyncLicenseNote:
      'У Health Sync есть пробный период, затем нужна лицензия. В справке разработчика описаны версия AppGallery и варианты оплаты для России.',
    gpsTitle: 'Что произойдёт с маршрутом GPS',
    gpsDescription:
      'Health Sync умеет передавать GPS-данные через Health Connect, если источник передал маршрут. Проверьте одну новую тренировку в Health Connect: разрешение на маршрут запрашивается отдельно, а его наличие зависит от Strava и Health Sync.',
    healthSyncGuideTitle: 'Инструкция Health Sync',
    healthSyncDataTypes: 'Данные и поддерживаемые сервисы',
    healthSyncHelp: 'Справка и настройка',
    healthConnectGuide: 'Как открыть Health Connect',
    missingWorkoutTitle: 'Если тренировка не появилась',
    missingWorkout:
      'Сначала проверьте, что тренировка появилась в Strava. В Health Sync выберите Strava источником, Health Connect назначением и разрешите запись тренировок и маршрутов. Затем откройте Health Connect и проверьте запись. Вернитесь сюда и нажмите «Обновить и синхронизировать». При первом чтении маршрута Runich может показать отдельный запрос доступа — подтвердите его, если хотите импортировать GPS.',
    updateProvider: 'Обновите Health Connect через Google Play, затем вернитесь сюда и повторите подключение.',
    openGooglePlay: 'Открыть Google Play',
    retry: 'Проверить ещё раз',
    providerUnavailable:
      'Health Connect не найден или не настроен. На Android 14 и новее откройте его через поиск в системных настройках. На Android 13 и старше установите приложение Health Connect из Google Play. Нужны Android 9 или новее и сервисы Google Play.',
    openHealthConnect: 'Открыть страницу Health Connect',
    minimumAndroid: 'Для Health Connect нужен Android 9 или новее и сервисы Google Play.',
    connect: 'Разрешить Runich читать Health Connect',
    connected: 'Хранилище подключено',
    connectedDescription:
      'После возвращения в Runich новые завершённые тренировки проверяются и отправляются автоматически. Повторные записи не создаются.',
    refresh: 'Обновить и синхронизировать',
    noWorkouts: 'Завершённых тренировок за последние 30 дней нет.',
    importSelected: 'Импортировать выбранные ({count})',
    diagnostics: {
      title: 'Диагностика импорта',
      platform: 'Платформа',
      store: 'хранилище',
      checking: 'проверяется',
      connected: 'подключение',
      account: 'аккаунт Runich',
      requiredPermissions: 'Все обязательные разрешения на чтение',
      permissions: 'Разрешения Health Connect',
      permissionsDetails:
        'ExerciseSession {exerciseSession} · Distance {distance} · Steps {steps}. Доступ к маршруту запрашивается отдельно для каждой записи.',
      statusError: 'Ошибка проверки/разрешения Health Connect',
      lastRead: 'Последнее чтение',
      range: 'период',
      status: 'статус',
      stage: 'этап',
      unknownStage: 'неизвестен',
      found: 'найдено',
      processed: 'обработано',
      error: 'ошибка',
      noRead: 'Чтение хранилища ещё не запускалось.',
      origin: 'источник',
      route: 'маршрут',
      points: 'точек',
      showingFirst: 'Показаны первые {shown} из {total}.',
      uploadStatus: 'Статус отправки в Runich',
      reason: 'причина',
      workouts: 'тренировок',
      gpsPoints: 'GPS-точек',
      imported: 'импортировано',
      skipped: 'пропущено',
      responseError: 'ответ/ошибка',
      noUpload: 'Запрос на импорт ещё не запускался.',
      note: 'Первое подключение только читает хранилище: найденные записи нужно выбрать и импортировать кнопкой ниже. Диагностика показывает метаданные и число GPS-точек; координаты не отображаются.',
    },
    steps: [
      {
        number: '1',
        title: 'Свяжите приложение часов со Strava',
        description:
          'В приложении производителя откройте подключённые сервисы или интеграции, выберите Strava и подтвердите доступ. Путь в меню зависит от приложения. Дождитесь, когда новая тренировка появится в Strava.',
      },
      {
        number: '2',
        title: 'Настройте Health Sync',
        description:
          'В Health Sync выберите Strava как источник, Health Connect как назначение и включите синхронизацию тренировок. Разрешите Health Sync записывать тренировки и маршрут. Если данные не появились, проверьте статус синхронизации в Health Sync.',
      },
      {
        number: '3',
        title: 'Разрешите Runich читать Health Connect',
        description:
          'Нажмите кнопку подключения ниже и разрешите Runich читать тренировки, расстояние и шаги. Для GPS-маршрута Android может отдельно запросить доступ к маршруту конкретной тренировки.',
      },
      {
        number: '4',
        title: 'Проверьте и импортируйте тренировки',
        description:
          'Runich покажет завершённые записи за последние 30 дней. Выберите нужные и нажмите «Импортировать выбранные». При следующих возвращениях новые записи будут синхронизироваться автоматически.',
      },
    ],
  },
  en: {
    title: 'Workout import',
    flow: 'Workout flow: watch → manufacturer app → Strava → Health Sync → Health Connect → Runich. Runich reads data from the phone’s health store, not directly from the watch.',
    appsTitle: 'Install the apps',
    appsIntro:
      'This flow uses your watch companion app, Strava, Health Sync, and Health Connect. Install Health Sync for Android through AppGallery.',
    healthSyncInstall: 'Health Sync in AppGallery',
    healthSyncLicense: 'Health Sync installation and license',
    healthSyncLicenseNote:
      'Health Sync has a trial period and then requires a license. Its help page describes the AppGallery version and payment options for Russia.',
    gpsTitle: 'What happens to the GPS route',
    gpsDescription:
      'Health Sync can transfer GPS data through Health Connect when the source provides a route. Check one new workout in Health Connect: route access is requested separately, and availability depends on Strava and Health Sync.',
    healthSyncGuideTitle: 'Health Sync guide',
    healthSyncDataTypes: 'Data types and supported apps',
    healthSyncHelp: 'Help and setup',
    healthConnectGuide: 'How to open Health Connect',
    missingWorkoutTitle: 'If a workout is missing',
    missingWorkout:
      'First check that the workout appears in Strava. In Health Sync, choose Strava as source and Health Connect as destination, and allow writing workouts and routes. Open Health Connect and check for the workout. Return here and tap Refresh and sync. When Runich first reads a route, Android may show a separate access prompt; grant it if you want GPS data.',
    updateProvider: 'Update Health Connect through Google Play, then return here and connect again.',
    openGooglePlay: 'Open Google Play',
    retry: 'Check again',
    providerUnavailable:
      'Health Connect was not found or is not set up. On Android 14 or later, open it by searching in system Settings. On Android 13 or earlier, install the Health Connect app from Google Play. Android 9 or later and Google Play services are required.',
    openHealthConnect: 'Open Health Connect page',
    minimumAndroid: 'Health Connect requires Android 9 or later and Google Play services.',
    connect: 'Allow Runich to read Health Connect',
    connected: 'Health store connected',
    connectedDescription:
      'When you return to Runich, new completed workouts are checked and uploaded automatically. Existing records are skipped.',
    refresh: 'Refresh and sync',
    noWorkouts: 'No completed workouts in the last 30 days.',
    importSelected: 'Import selected ({count})',
    diagnostics: {
      title: 'Import diagnostics',
      platform: 'Platform',
      store: 'store',
      checking: 'checking',
      connected: 'connected',
      account: 'Runich account',
      requiredPermissions: 'All required read permissions',
      permissions: 'Health Connect permissions',
      permissionsDetails:
        'ExerciseSession {exerciseSession} · Distance {distance} · Steps {steps}. Route access is requested separately for each record.',
      statusError: 'Health Connect status/permission error',
      lastRead: 'Last read',
      range: 'range',
      status: 'status',
      stage: 'stage',
      unknownStage: 'unknown',
      found: 'found',
      processed: 'processed',
      error: 'error',
      noRead: 'Health store has not been read yet.',
      origin: 'origin',
      route: 'route',
      points: 'points',
      showingFirst: 'Showing the first {shown} of {total}.',
      uploadStatus: 'Runich upload status',
      reason: 'reason',
      workouts: 'workouts',
      gpsPoints: 'GPS points',
      imported: 'imported',
      skipped: 'skipped',
      responseError: 'response/error',
      noUpload: 'No import request has been made yet.',
      note: 'The first connection only reads the health store: select the found workouts and import them with the button below. Diagnostics show metadata and GPS point counts; coordinates are not displayed.',
    },
    steps: [
      {
        number: '1',
        title: 'Connect the watch app to Strava',
        description:
          'In the companion app, open connected services or integrations, choose Strava, and authorize access. Menu names vary by app. Wait for a new workout to appear in Strava.',
      },
      {
        number: '2',
        title: 'Set up Health Sync',
        description:
          'In Health Sync, choose Strava as the source, Health Connect as the destination, and enable workout syncing. Allow Health Sync to write workouts and routes. Check its sync status if data does not appear.',
      },
      {
        number: '3',
        title: 'Allow Runich to read Health Connect',
        description:
          'Tap the connection button below and allow Runich to read workouts, distance, and steps. Android may ask separately for access to an individual workout route.',
      },
      {
        number: '4',
        title: 'Review and import workouts',
        description:
          'Runich will show completed records from the last 30 days. Select the ones you want and tap Import selected. New records sync automatically when you return to Runich later.',
      },
    ],
  },
} as const;
