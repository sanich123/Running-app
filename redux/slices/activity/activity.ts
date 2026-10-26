import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ACTIVITY_DRAFT_INITIAL_STATE, ACTIVITY_INITIAL_STATE, FINISHED_ACTIVITY_INITIAL_STATE } from './const';
import type { ActivityPhoto, ActivityState, FinishedActivityDraft, PendingActivity } from './types';

const activity = createSlice({
  name: 'activity',
  initialState: ACTIVITY_INITIAL_STATE,
  reducers: {
    setSavingDisabled: (state, action: PayloadAction<boolean>) => {
      state.isSavingDisabled = action.payload;
    },
    startMediaUpload: (state) => {
      state.activeMediaUploadCount += 1;
    },
    finishMediaUpload: (state) => {
      state.activeMediaUploadCount = Math.max(0, state.activeMediaUploadCount - 1);
    },
    setFinishedActivity: (state, action: PayloadAction<FinishedActivityDraft>) => {
      state.finishedActivity = action.payload;
    },
    resetFinishedActivity: (state) => {
      state.finishedActivity = FINISHED_ACTIVITY_INITIAL_STATE;
    },
    setSport: (state, action: PayloadAction<ActivityState['sport']>) => {
      state.sport = action.payload;
    },
    addPhotoUrl: (state, action: PayloadAction<ActivityPhoto>) => {
      state.media = [action.payload, ...state.media];
    },
    addPhotoUrls: (state, action: PayloadAction<ActivityPhoto[]>) => {
      state.media = [...action.payload, ...state.media];
    },
    removePhotoUrl: (state, action: PayloadAction<{ url?: string | null; assetId?: string; id?: string }>) => {
      const { url, assetId, id } = action.payload;
      state.media = state.media.filter((media) =>
        id ? media.id !== id : assetId ? media.assetId !== assetId : media.url !== url,
      );
    },
    resetActivityDraft: (state) => {
      state.sport = ACTIVITY_DRAFT_INITIAL_STATE.sport;
      state.media = [];
    },
    queueUnsyncedActivity: (state, action: PayloadAction<PendingActivity>) => {
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
  startMediaUpload,
  finishMediaUpload,
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
