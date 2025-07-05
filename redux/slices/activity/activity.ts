import { createSlice } from '@reduxjs/toolkit';

import { ACTIVITY_INITIAL_STATE, ADDITIONAL_INFO_INITIAL_STATE, FINISHED_ACTIVITY_INITIAL_STATE } from './const';

export const activity = createSlice({
  name: 'activity',
  initialState: ACTIVITY_INITIAL_STATE,
  reducers: {
    saveTitle: (state, action) => {
      state.additionalInfo.title = action.payload;
    },
    saveDescription: (state, action) => {
      state.additionalInfo.description = action.payload;
    },
    saveSport: (state, action) => {
      state.additionalInfo.sport = action.payload;
    },
    saveEmotion: (state, action) => {
      state.additionalInfo.emotion = action.payload;
    },
    saveIsPublic: (state, action) => {
      state.additionalInfo.isPublic = action.payload;
    },
    addPhotoUrl: (state, action) => {
      state.additionalInfo.photoVideoUrls = [action.payload, ...state.additionalInfo.photoVideoUrls];
    },
    addPhotoUrls: (state, action) => {
      state.additionalInfo.photoVideoUrls = [...action.payload, ...state.additionalInfo.photoVideoUrls];
    },
    deletePhotoUrl: (state, action) => {
      state.additionalInfo.photoVideoUrls = state.additionalInfo.photoVideoUrls.filter(
        ({ url }) => url !== action.payload,
      );
    },
    setIsDisableWhileSending: (state, action) => {
      state.isDisabledWhileSending = action.payload;
    },
    resetActivityInfo: (state) => {
      state.additionalInfo = { ...ADDITIONAL_INFO_INITIAL_STATE, sport: state.additionalInfo.sport };
    },
    setIsEditingActivity: (state, action) => {
      state.isEditingActivity = action.payload;
    },
    saveUnsendedActivity: (state, action) => {
      state.unsyncedActivities = [...state.unsyncedActivities, action.payload];
    },
    refreshUnsendedActivitiesList: (state, action) => {
      state.unsyncedActivities = action.payload;
    },
    setIsHaveUnsyncedActivity: (state, action) => {
      state.isHaveUnsyncedActivity = action.payload;
    },
    setIsManualAdding: (state, action) => {
      state.isManualAdding = action.payload;
    },
    setManualDate: (state, action) => {
      state.manualDate = action.payload;
    },
    setManualHours: (state, action) => {
      state.manualHours = Number(action.payload);
    },
    setManualMinutes: (state, action) => {
      state.manualMinutes = Number(action.payload);
    },
    setManualDistance: (state, action) => {
      state.manualDistance = Number(action.payload);
    },
    saveFinishedActivity: (state, action) => {
      state.finishedActivity = action.payload;
    },
    resetFinishedActivity: (state) => {
      state.finishedActivity = FINISHED_ACTIVITY_INITIAL_STATE;
    },
    resetManualData: (state) => {
      state.manualDate = `${new Date()}`;
      state.manualDistance = 0;
      state.manualHours = 0;
      state.manualMinutes = 0;
    },
    resetPhotoUrls: (state) => {
      state.additionalInfo.photoVideoUrls = [];
    },
    setCameraIsVisible: (state, action) => {
      state.isCameraVisible = action.payload;
    },
  },
});

export const {
  saveTitle,
  saveDescription,
  saveSport,
  saveEmotion,
  setManualDate,
  saveIsPublic,
  setIsDisableWhileSending,
  resetActivityInfo,
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
  refreshUnsendedActivitiesList,
  setIsManualAdding,
  setManualHours,
  setManualMinutes,
  setManualDistance,
  saveFinishedActivity,
  resetFinishedActivity,
  resetManualData,
  setCameraIsVisible,
  addPhotoUrl,
  addPhotoUrls,
  deletePhotoUrl,
  resetPhotoUrls,
  setIsEditingActivity,
} = activity.actions;

export default activity.reducer;
