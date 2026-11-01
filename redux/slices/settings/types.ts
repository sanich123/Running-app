import { getLocales } from 'expo-localization';
import { LANGUAGES } from '@const/enums';

export type ActivityVoiceMetric = 'pace' | 'movingTime' | 'elevation';

export const DEFAULT_NAVIGATION_ALERT_DISTANCE_METERS = 50;
export const MIN_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES = 1;
export const MAX_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES = 10;
export type NavigationAlertRepeatIntervalMinutes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export const DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES: NavigationAlertRepeatIntervalMinutes = 1;

export function getNavigationAlertRepeatIntervalMinutes(value: unknown): NavigationAlertRepeatIntervalMinutes {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES;
  return Math.min(
    MAX_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES,
    Math.max(MIN_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES, Math.round(value)),
  ) as NavigationAlertRepeatIntervalMinutes;
}

export function getNavigationAlertDistanceMeters(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_NAVIGATION_ALERT_DISTANCE_METERS;
  return Math.min(200, Math.max(10, Math.round(value / 10) * 10));
}

export interface ActivityReminder {
  id: string;
  intervalMinutes: number;
  text: string;
}

export interface ActivitySettings {
  language: LANGUAGES;
  theme: 'light' | 'dark' | null;
  isProfileFilled: boolean;
  activityVoiceEnabled: boolean;
  activityVoiceMetrics: ActivityVoiceMetric[];
  activityVoiceIdentifier: string | null;
  activityReminderEnabled: boolean;
  activityReminders: ActivityReminder[];
  navigationAlertDistanceMeters: number;
  navigationAlertRepeatIntervalMinutes: NavigationAlertRepeatIntervalMinutes;
  navigationAlertsMuted: boolean;
  saveCameraPhotosToGallery: boolean;
}

export const DEFAULT_ACTIVITY_VOICE_METRICS: ActivityVoiceMetric[] = ['pace', 'movingTime', 'elevation'];

export const SETTINGS_INITIAL_STATE: ActivitySettings = {
  language: getLocales()[0]?.languageCode?.toLowerCase() === 'ru' ? LANGUAGES.russian : LANGUAGES.english,
  theme: null as 'light' | 'dark' | null,
  isProfileFilled: false,
  activityVoiceEnabled: false,
  activityVoiceMetrics: [...DEFAULT_ACTIVITY_VOICE_METRICS],
  activityVoiceIdentifier: null as string | null,
  activityReminderEnabled: false,
  activityReminders: [],
  navigationAlertDistanceMeters: DEFAULT_NAVIGATION_ALERT_DISTANCE_METERS,
  navigationAlertRepeatIntervalMinutes: DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES,
  navigationAlertsMuted: false,
  saveCameraPhotosToGallery: false,
};

export function getActivitySettings(settings: Partial<ActivitySettings>) {
  const activityVoiceMetrics = Array.isArray(settings.activityVoiceMetrics)
    ? settings.activityVoiceMetrics.filter((metric) => DEFAULT_ACTIVITY_VOICE_METRICS.includes(metric))
    : [...DEFAULT_ACTIVITY_VOICE_METRICS];
  const activityReminders = Array.isArray(settings.activityReminders)
    ? settings.activityReminders.reduce<ActivityReminder[]>((reminders, reminder) => {
        if (
          typeof reminder?.id !== 'string' ||
          !reminder.id ||
          typeof reminder.intervalMinutes !== 'number' ||
          !Number.isFinite(reminder.intervalMinutes) ||
          reminder.intervalMinutes <= 0 ||
          typeof reminder.text !== 'string' ||
          !reminder.text.trim()
        ) {
          return reminders;
        }

        reminders.push({
          id: reminder.id,
          intervalMinutes: Math.max(1, Math.round(reminder.intervalMinutes)),
          text: reminder.text.trim(),
        });
        return reminders;
      }, [])
    : [];

  return {
    activityVoiceEnabled: settings.activityVoiceEnabled ?? SETTINGS_INITIAL_STATE.activityVoiceEnabled,
    activityVoiceMetrics,
    activityVoiceIdentifier:
      typeof settings.activityVoiceIdentifier === 'string' ? settings.activityVoiceIdentifier : null,
    activityReminderEnabled: settings.activityReminderEnabled ?? SETTINGS_INITIAL_STATE.activityReminderEnabled,
    activityReminders,
  };
}
