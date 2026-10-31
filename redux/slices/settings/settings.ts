import { createSlice } from '@reduxjs/toolkit';
import { SETTINGS_INITIAL_STATE } from './types';

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
    setNavigationAlertDistanceMeters: (state, action) => {
      state.navigationAlertDistanceMeters = action.payload;
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
  changeLanguage,
  changeTheme,
  setIsProfileFilled,
  setActivityVoiceEnabled,
  setActivityVoiceMetrics,
  setActivityVoiceIdentifier,
  setActivityReminderEnabled,
  setNavigationAlertDistanceMeters,
  setSaveCameraPhotosToGallery,
  addActivityReminder,
  removeActivityReminder,
} = settings.actions;
export default settings.reducer;
