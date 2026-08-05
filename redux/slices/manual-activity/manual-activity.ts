import { createSlice } from '@reduxjs/toolkit';
import { MANUAL_ACTIVITY_INITIAL_STATE } from './const';

export const manualActivity = createSlice({
  name: 'manualActivity',
  initialState: MANUAL_ACTIVITY_INITIAL_STATE,
  reducers: {
    setIsManualAdding: (state, { payload }) => {
      state.isManualAdding = payload;
    },
    setIsEditingActivity: (state, { payload }) => {
      state.isEditingActivity = payload;
    },
    setCameraIsVisible: (state, { payload }) => {
      state.isCameraVisible = payload;
    },
    setManualDate: (state, { payload }) => {
      state.manualDate = payload;
    },
    setManualHours: (state, { payload }) => {
      state.manualHours = Number(payload);
    },
    setManualMinutes: (state, { payload }) => {
      state.manualMinutes = Number(payload);
    },
    setManualDistance: (state, { payload }) => {
      state.manualDistance = Number(payload);
    },
    resetManualData: (state) => {
      state.manualDate = `${new Date()}`;
      state.manualDistance = 0;
      state.manualHours = 0;
      state.manualMinutes = 0;
    },
    resetManualActivitySlice: () => {
      return MANUAL_ACTIVITY_INITIAL_STATE;
    },
  },
});

export const {
  setIsManualAdding,
  setIsEditingActivity,
  setManualDate,
  setManualHours,
  setManualMinutes,
  setManualDistance,
  resetManualData,
  resetManualActivitySlice,
  setCameraIsVisible,
} = manualActivity.actions;

export default manualActivity.reducer;
