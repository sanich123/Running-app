import { createSlice } from '@reduxjs/toolkit';
import { Location } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';

import { STATUSES } from '../../constants/enums';

type LastKmSplit = {
  lastKilometerDuration: number;
  kilometerPoint: LocationObject;
  lastKilometerAltitude: number;
};

export const location = createSlice({
  name: 'location',
  initialState: {
    activityStatus: STATUSES.initial,
    isAppShutedByPhone: false,
    isMapVisible: true,
    initialLocation: {} as Location,
    distance: 0,
    duration: 0,
    durationWithPauses: 0,
    altitude: 0,
    lastKilometerAltitude: 0,
    lastKilometer: 0,
    lastKilometerDuration: 0,
    currentPace: 0,
    kilometresSplit: [] as LastKmSplit[],
    locationsWithPauses: [] as LocationObject[][],
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
      state.altitude = 0;
      state.kilometresSplit = [];
      state.currentPace = 0;
      state.locationsWithPauses = [];
    },
    setDistance: (state, action) => {
      state.distance = state.distance + action.payload;
    },
    setDuration: (state, action) => {
      state.duration = state.duration + action.payload;
    },
    setDurationWithPauses: (state, action) => {
      state.durationWithPauses = action.payload;
    },
    setAltitude: (state, action) => {
      state.altitude = state.altitude + action.payload;
    },
    setLastKmAltitude: (state, action) => {
      state.lastKilometerAltitude = state.lastKilometerAltitude + action.payload;
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
      state.lastKilometerAltitude = 0;
    },
    addDurationAndLocationToKmSplits: (state, action) => {
      state.kilometresSplit = [
        ...state.kilometresSplit,
        {
          lastKilometerDuration: state.lastKilometerDuration,
          kilometerPoint: action.payload,
          lastKilometerAltitude: state.lastKilometerAltitude,
        },
      ];
    },
    setIsAppShuted: (state, action) => {
      state.isAppShutedByPhone = action.payload;
    },
    setIsMapVisible: (state, action) => {
      state.isMapVisible = action.payload;
    },
    setEmptyLastArrayWhenPaused: (state) => {
      state.locationsWithPauses = [...state.locationsWithPauses, []];
    },
    setLocationsWhenContinued: (state, action) => {
      state.locationsWithPauses[state.locationsWithPauses.length - 1].push(action.payload);
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
  setAltitude,
  setLastKmAltitude,
  setActivityStatus,
  setLastKm,
  resetLastKm,
  setLastKmDuration,
  addDurationAndLocationToKmSplits,
  setCurrentPace,
  setIsAppShuted,
  setIsMapVisible,
  setEmptyLastArrayWhenPaused,
  setLocationsWhenContinued,
  setDurationWithPauses,
} = location.actions;
export default location.reducer;
