import { createSlice } from '@reduxjs/toolkit';
import type { UnsyncedActivities } from './const';

export const unsendedActivity = createSlice({
  name: 'unsendedActivity',
  initialState: { isHaveUnsyncedActivity: false, unsyncedActivities: [] as UnsyncedActivities },
  reducers: {
    saveUnsendedActivity: (state, { payload }) => {
      state.unsyncedActivities = [...state.unsyncedActivities, payload];
      state.isHaveUnsyncedActivity = true;
    },
    refreshUnsendedActivitiesList: (state, { payload }) => {
      state.unsyncedActivities = payload;
      state.isHaveUnsyncedActivity = payload.length > 0;
    },
    setIsHaveUnsyncedActivity: (state, { payload }) => {
      state.isHaveUnsyncedActivity = payload;
    },
    clearUnsendedActivities: (state) => {
      state.unsyncedActivities = [];
      state.isHaveUnsyncedActivity = false;
    },
  },
});

export const {
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
  refreshUnsendedActivitiesList,
  clearUnsendedActivities,
} = unsendedActivity.actions;

export default unsendedActivity.reducer;
