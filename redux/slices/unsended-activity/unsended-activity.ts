import { createSlice } from '@reduxjs/toolkit';
import type { UnsyncedActivities } from './const';

const unsendedActivity = createSlice({
  name: 'unsendedActivity',
  initialState: { isHaveUnsyncedActivity: false, unsyncedActivities: [] as UnsyncedActivities },
  reducers: {
    saveUnsendedActivity: (state, { payload }) => {
      state.unsyncedActivities = [...state.unsyncedActivities, payload];
      state.isHaveUnsyncedActivity = true;
    },
    setIsHaveUnsyncedActivity: (state, { payload }) => {
      state.isHaveUnsyncedActivity = payload;
    },
    removeUnsendedActivityFromList: (state) => {
      state.unsyncedActivities = state.unsyncedActivities.slice(1);
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
  removeUnsendedActivityFromList,
  clearUnsendedActivities,
} = unsendedActivity.actions;

export default unsendedActivity.reducer;
