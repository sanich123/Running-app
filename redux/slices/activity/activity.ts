import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ACTIVITY_DRAFT_INITIAL_STATE, ACTIVITY_INITIAL_STATE, FINISHED_ACTIVITY_INITIAL_STATE } from './const';
import type { ActivityPhoto, ActivityState } from './types';
import type { ActivityToSend, FinishedActivity } from '@R/services/activity/types';

const activity = createSlice({
  name: 'activity',
  initialState: ACTIVITY_INITIAL_STATE,
  reducers: {
    setSavingDisabled: (state, action: PayloadAction<boolean>) => {
      state.isSavingDisabled = action.payload;
    },
    setFinishedActivity: (state, action: PayloadAction<FinishedActivity>) => {
      state.finishedActivity = action.payload;
    },
    resetFinishedActivity: (state) => {
      state.finishedActivity = FINISHED_ACTIVITY_INITIAL_STATE;
    },
    setSport: (state, action: PayloadAction<ActivityState['sport']>) => {
      state.sport = action.payload;
    },
    addPhotoUrl: (state, action: PayloadAction<ActivityPhoto>) => {
      state.photoVideoUrls = [action.payload, ...state.photoVideoUrls];
    },
    addPhotoUrls: (state, action: PayloadAction<ActivityPhoto[]>) => {
      state.photoVideoUrls = [...action.payload, ...state.photoVideoUrls];
    },
    removePhotoUrl: (state, action: PayloadAction<string>) => {
      state.photoVideoUrls = state.photoVideoUrls.filter(({ url }) => url !== action.payload);
    },
    resetActivityDraft: (state) => {
      state.sport = ACTIVITY_DRAFT_INITIAL_STATE.sport;
      state.photoVideoUrls = [];
    },
    queueUnsyncedActivity: (state, action: PayloadAction<ActivityToSend>) => {
      state.unsyncedActivities.push(action.payload);
    },
    removeFirstUnsyncedActivity: (state) => {
      state.unsyncedActivities = state.unsyncedActivities.slice(1);
    },
    clearUnsyncedActivities: (state) => {
      state.unsyncedActivities = [];
    },
  },
});

export const {
  setSavingDisabled,
  setFinishedActivity,
  resetFinishedActivity,
  setSport,
  addPhotoUrl,
  addPhotoUrls,
  removePhotoUrl,
  resetActivityDraft,
  queueUnsyncedActivity,
  removeFirstUnsyncedActivity,
  clearUnsyncedActivities,
} = activity.actions;

export default activity.reducer;
