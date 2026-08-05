import { createSlice } from '@reduxjs/toolkit';
import { ACTIVITY_INITIAL_STATE, FINISHED_ACTIVITY_INITIAL_STATE } from './const';

export const activity = createSlice({
  name: 'activity',
  initialState: ACTIVITY_INITIAL_STATE,
  reducers: {
    setIsDisableWhileSending: (state, action) => {
      state.isDisabledWhileSending = action.payload;
    },
    setActivityId: (state, { payload }) => {
      state.activityId = payload;
    },
    saveFinishedActivity: (state, action) => {
      state.finishedActivity = action.payload;
    },
    resetFinishedActivity: (state) => {
      state.finishedActivity = FINISHED_ACTIVITY_INITIAL_STATE;
    },
    resetActivitySlice: () => {
      return ACTIVITY_INITIAL_STATE;
    },
  },
});

export const {
  setIsDisableWhileSending,
  saveFinishedActivity,
  resetFinishedActivity,
  resetActivitySlice,
  setActivityId,
} = activity.actions;

export default activity.reducer;
