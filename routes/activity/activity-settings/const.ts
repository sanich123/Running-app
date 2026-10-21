import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Platform, TextInput } from 'react-native';
import { LANGUAGES } from '@const/enums';
import type { ActivityVoiceMetric } from '@R/slices/settings/types';

export const ACTIVITY_SETTINGS = {
  [LANGUAGES.english]: {
    title: 'Activity settings',
    open: 'Activity settings',
    voiceAnnouncementsDescription: 'Announce completed kilometres during recording',
    voiceAnnouncementsEnabled: 'Enable voice announcements',
    voice: 'Voice',
    systemVoice: 'System default voice',
    voicesUnavailable: 'No system voices available',
    metrics: 'Announce after each kilometre',
    pace: 'Pace',
    movingTime: 'Moving time',
    elevation: 'Elevation gain',
    remindersDescription: 'Read your saved reminders during the activity',
    remindersEnabled: 'Enable reminders',
    locationTrackingTitle: 'Location and workout tracking',
    locationTrackingInfoTitle: 'Location and workout tracking information',
    locationTrackingInfoDescription: 'Permissions, metric recording, and Android limitations',
    locationTrackingDetails:
      'Location is used to record your route and workout metrics. Background location is needed only while an active workout is being tracked, so tracking can continue when the screen is locked or the app is minimized.\n\nDuring a workout, the app calculates distance, pace, moving time, and elevation from a sequence of location points. Points with an unrealistically high speed are not recorded; this filters GPS jumps. The limit depends on the activity: walking up to 15 km/h, running up to 30 km/h, cycling up to 60 km/h, and hiking up to 20 km/h.\n\nAndroid cannot guarantee that a background process will never be stopped: manufacturers ship different system versions, shells, and background restrictions. We tested recording on a Xiaomi phone, and workouts lasting up to 3 hours were recorded normally. For better reliability, turn off battery optimization and background activity restrictions for Runich.\n\nImportant: a rare issue may occur. This is a known bug in the library responsible for starting background tracking. If background tracking is interrupted by the phone or by the user, the tracking task may not start again.\n\nWhat it looks like:\n• The map keeps receiving location updates and changing position.\n• New location points are not saved, so the route and metrics may stop updating.\n\nWhat to do: in practice, the only reliable workaround was to finish the workout, restart the app, and try recording a new workout again.',
    reminderInterval: 'Interval',
    reminderIntervalPlaceholder: 'Minutes',
    reminderText: 'Reminder text',
    reminderTextPlaceholder: 'Time to drink water',
    installReminder: 'Set reminder',
    savedReminders: 'Saved reminders',
    noReminders: 'No reminders set',
    deleteReminder: 'Delete reminder',
    minutes: 'min',
  },
  [LANGUAGES.russian]: {
    title: 'Настройки активности',
    open: 'Настройки активности',
    voiceAnnouncementsDescription: 'Озвучивать завершённые километры во время записи',
    voiceAnnouncementsEnabled: 'Включить голосовые объявления',
    voice: 'Голос',
    systemVoice: 'Системный голос по умолчанию',
    voicesUnavailable: 'Системные голоса не найдены',
    metrics: 'Озвучивать после каждого километра',
    pace: 'Темп',
    movingTime: 'Время движения',
    elevation: 'Набор высоты',
    remindersDescription: 'Озвучивать сохранённые напоминания во время активности',
    remindersEnabled: 'Включить напоминания',
    locationTrackingTitle: 'Геопозиция и отслеживание тренировки',
    locationTrackingInfoTitle: 'Информация о геопозиции и отслеживании тренировок',
    locationTrackingInfoDescription: 'Разрешения, запись метрик и ограничения Android',
    locationTrackingDetails:
      'Геопозиция нужна для записи маршрута и метрик тренировки. Доступ к геопозиции в фоне нужен только во время активной тренировки — чтобы отслеживание продолжалось, когда экран заблокирован или приложение свернуто.\n\nВо время тренировки приложение рассчитывает расстояние, темп, время движения и набор высоты по последовательности точек геопозиции. Точки с нереалистично высокой скоростью не записываются — это фильтрация скачков GPS. Порог зависит от вида активности: ходьба — до 15 км/ч, бег — до 30 км/ч, велосипед — до 60 км/ч, поход — до 20 км/ч.\n\nНа Android нельзя гарантировать, что фоновый процесс не будет завершён: производители используют разные версии системы, оболочки и ограничения фоновой работы. Мы тестировали запись на телефоне Xiaomi — тренировки длительностью до 3 часов записывались нормально. Для более стабильной записи отключите оптимизацию батареи и ограничения фоновой активности для Runich. \n\nВажно: иногда возникает редкий сбой. Это известный баг библиотеки, которая отвечает за запуск отслеживания в фоновом режиме. Если фоновое отслеживание было прервано телефоном или пользователем, задача отслеживания может не запуститься снова.\n\nКак это выглядит:\n• Карта продолжает получать геопозицию и менять своё положение.\n• Новые точки геопозиции при этом не записываются, поэтому маршрут и метрики могут перестать обновляться.\n\nЧто делать: на практике срабатывал только такой способ — завершить тренировку, перезапустить приложение и снова начать запись.',
    reminderInterval: 'Интервал',
    reminderIntervalPlaceholder: 'Минуты',
    reminderText: 'Текст напоминания',
    reminderTextPlaceholder: 'Пора попить воды',
    installReminder: 'Установить напоминание',
    savedReminders: 'Сохранённые напоминания',
    noReminders: 'Напоминания не установлены',
    deleteReminder: 'Удалить напоминание',
    minutes: 'мин',
  },
} as const;

export function createActivityReminderId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const ACTIVITY_VOICE_METRICS: ActivityVoiceMetric[] = ['pace', 'movingTime', 'elevation'];

export const ACTIVITY_VOICE_PREVIEW = {
  [LANGUAGES.english]:
    'First kilometre. Pace five minutes thirty seconds per kilometre. Moving time five minutes thirty seconds. Elevation gain ten meters.',
  [LANGUAGES.russian]:
    'Первый километр. Темп пять минут тридцать секунд на километр. Время движения пять минут тридцать секунд. Набор высоты десять метров.',
} as const;

export const ActivitySettingsTextInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;
