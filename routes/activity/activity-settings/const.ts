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
