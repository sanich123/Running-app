import { createSlice } from '@reduxjs/toolkit';
import { Location } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';

import { STATUSES } from '../../constants/enums';

type LastKmSplit = { lastKilometerDuration: number; kilometerPoint: LocationObject };

export const location = createSlice({
  name: 'location',
  initialState: {
    activityStatus: STATUSES.initial,
    initialLocation: {} as Location,
    distance: 0,
    duration: 0,
    lastKilometer: 0,
    lastKilometerDuration: 0,
    currentPace: 0,
    kilometresSplit: [] as LastKmSplit[],
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
      state.duration = 0;
      state.distance = 0;
    },
    setDistance: (state, action) => {
      state.distance = state.distance + action.payload;
    },
    setDuration: (state, action) => {
      state.duration = state.duration + action.payload;
    },
    setActivityStatus: (state, action) => {
      state.activityStatus = action.payload;
    },
    setLastKm: (state, action) => {
      state.lastKilometer = state.lastKilometer + action.payload;
    },
    setLastKmDuration: (state, action) => {
      state.lastKilometerDuration = state.lastKilometerDuration + action.payload;
    },
    setCurrentPace: (state, action) => {
      state.currentPace = action.payload;
    },
    resetLastKm: (state) => {
      state.lastKilometer = 0;
      state.lastKilometerDuration = 0;
    },
    addDurationAndLocationToKmSplits: (state, action) => {
      state.kilometresSplit = [
        ...state.kilometresSplit,
        { lastKilometerDuration: state.lastKilometerDuration, kilometerPoint: action.payload },
      ];
    },
  },
});

export const {
  setInitialLocation,
  saveFinishedActivity,
  setLocationsFromBackground,
  resetLocationsFromBackground,
  setDistance,
  setDuration,
  setActivityStatus,
  setLastKm,
  resetLastKm,
  setLastKmDuration,
  addDurationAndLocationToKmSplits,
  setCurrentPace,
} = location.actions;
export default location.reducer;
