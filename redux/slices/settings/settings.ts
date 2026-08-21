import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGES } from '@const/enums';
import type { ActivityReminder, ActivitySettings, ActivityVoiceMetric } from './types';

export const DEFAULT_ACTIVITY_VOICE_METRICS: ActivityVoiceMetric[] = ['pace', 'movingTime', 'elevation'];

export const SETTINGS_INITIAL_STATE: ActivitySettings = {
  language: LANGUAGES.russian,
  theme: null as 'light' | 'dark' | null,
  isProfileFilled: false,
  activityVoiceEnabled: true,
  activityVoiceMetrics: [...DEFAULT_ACTIVITY_VOICE_METRICS],
  activityVoiceIdentifier: null as string | null,
  activityReminderEnabled: false,
  activityReminders: [],
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

const settings = createSlice({
  name: 'settings',
  initialState: SETTINGS_INITIAL_STATE,
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
    changeTheme: (state, action) => {
      state.theme = action.payload;
    },
    setIsProfileFilled: (state, action) => {
      state.isProfileFilled = action.payload;
    },
    setActivityVoiceEnabled: (state, action) => {
      state.activityVoiceEnabled = action.payload;
    },
    setActivityVoiceMetrics: (state, action) => {
      state.activityVoiceMetrics = action.payload;
    },
    setActivityVoiceIdentifier: (state, action) => {
      state.activityVoiceIdentifier = action.payload;
    },
    setActivityReminderEnabled: (state, action) => {
      state.activityReminderEnabled = action.payload;
    },
    addActivityReminder: (state, action) => {
      state.activityReminders.push(action.payload);
    },
    removeActivityReminder: (state, action) => {
      state.activityReminders = state.activityReminders.filter((reminder) => reminder.id !== action.payload);
    },
    resetActivityReminders: (state) => {
      state.activityReminders = [];
    },
  },
});

export const {
  changeLanguage,
  changeTheme,
  setIsProfileFilled,
  setActivityVoiceEnabled,
  setActivityVoiceMetrics,
  setActivityVoiceIdentifier,
  setActivityReminderEnabled,
  addActivityReminder,
  removeActivityReminder,
  resetActivityReminders,
} = settings.actions;
export default settings.reducer;
