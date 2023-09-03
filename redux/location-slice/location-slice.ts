import { createSlice } from '@reduxjs/toolkit';
import { Location } from '@rnmapbox/maps';

export const location = createSlice({
  name: 'location',
  initialState: {
    initialLocation: {} as Location,
    duration: 0,
    finishedActivity: {
      locations: [] as Location[],
      duration: 0,
      speed: 0,
      distance: 0,
    },
  },
  reducers: {
    setInitialLocation: (state, action) => {
      state.initialLocation = action.payload;
    },
    saveFinishedActivity: (state, action) => {
      state.finishedActivity = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
  },
});

export const { setInitialLocation, setDuration, saveFinishedActivity } = location.actions;
export default location.reducer;
