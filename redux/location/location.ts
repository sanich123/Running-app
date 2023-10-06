import { createSlice } from '@reduxjs/toolkit';
import { Location } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';

export const location = createSlice({
  name: 'location',
  initialState: {
    initialLocation: {} as Location,
    locationsFromBackground: [] as LocationObject[],
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
    setLocationsFromBackground: (state, action) => {
      state.locationsFromBackground = [...state.locationsFromBackground, action.payload];
    },
    resetLocationsFromBackground: (state) => {
      state.locationsFromBackground = [];
    },
  },
});

export const { setInitialLocation, saveFinishedActivity, setLocationsFromBackground, resetLocationsFromBackground } =
  location.actions;
export default location.reducer;
