import { createSlice } from '@reduxjs/toolkit';
import type { UnsyncedActivities } from './const';

export const unsendedActivity = createSlice({
  name: 'unsendedActivity',
  initialState: { isHaveUnsyncedActivity: false, unsyncedActivities: [] as UnsyncedActivities },
  reducers: {
    saveUnsendedActivity: (state, { payload }) => {
      state.unsyncedActivities = [...state.unsyncedActivities, payload];
    },
    refreshUnsendedActivitiesList: (state, { payload }) => {
      state.unsyncedActivities = payload;
    },
    setIsHaveUnsyncedActivity: (state, { payload }) => {
      state.isHaveUnsyncedActivity = payload;
    },
  },
});

export const { saveUnsendedActivity, setIsHaveUnsyncedActivity, refreshUnsendedActivitiesList } =
  unsendedActivity.actions;

export default unsendedActivity.reducer;
