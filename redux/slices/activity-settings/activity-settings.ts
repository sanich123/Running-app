import { createSlice } from '@reduxjs/toolkit';
import { ACTIVITY_SETTINGS_INITIAL_STATE } from './types';

const activitySettings = createSlice({
  name: 'activitySettings',
  initialState: ACTIVITY_SETTINGS_INITIAL_STATE,
  reducers: {
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
    setNavigationAlertDistanceMeters: (state, action) => {
      state.navigationAlertDistanceMeters = action.payload;
    },
    setNavigationAlertRepeatIntervalMinutes: (state, action) => {
      state.navigationAlertRepeatIntervalMinutes = action.payload;
    },
    setNavigationAlertsMuted: (state, action) => {
      state.navigationAlertsMuted = action.payload;
    },
    setSaveCameraPhotosToGallery: (state, action) => {
      state.saveCameraPhotosToGallery = action.payload;
    },
    addActivityReminder: (state, action) => {
      state.activityReminders = [...(state.activityReminders ?? []), action.payload];
    },
    removeActivityReminder: (state, action) => {
      state.activityReminders = (state.activityReminders ?? []).filter((reminder) => reminder.id !== action.payload);
    },
  },
});

export const {
  setActivityVoiceEnabled,
  setActivityVoiceMetrics,
  setActivityVoiceIdentifier,
  setActivityReminderEnabled,
  setNavigationAlertDistanceMeters,
  setNavigationAlertRepeatIntervalMinutes,
  setNavigationAlertsMuted,
  setSaveCameraPhotosToGallery,
  addActivityReminder,
  removeActivityReminder,
} = activitySettings.actions;
export default activitySettings.reducer;
