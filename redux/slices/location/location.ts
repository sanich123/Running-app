import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { LOCATION_INITIAL_STATE } from './const';
import type { TrackingRecoveryMetrics } from '@R/slices/tracking-recovery/types';

const location = createSlice({
  name: 'location',
  initialState: LOCATION_INITIAL_STATE,
  reducers: {
    restoreLocationsFromJournal: (state, action) => {
      const { locationsFromBackground, locationsWithPauses } = action.payload;
      state.locationsFromBackground = locationsFromBackground;
      state.locationsWithPauses = locationsWithPauses.length ? locationsWithPauses : [[]];
    },
    restoreTrackingMetrics: (state, action: PayloadAction<TrackingRecoveryMetrics>) => {
      Object.assign(state, action.payload);
    },
    setInitialLocation: (state, action) => {
      state.initialLocation = action.payload;
    },
    setLocationsFromBackground: (state, action) => {
      state.locationsFromBackground = [...state.locationsFromBackground, action.payload];
    },
    setDistance: (state, action) => {
      state.distance = state.distance + action.payload;
    },
    setSteps: (state, action) => {
      state.steps = action.payload;
    },
    setDuration: (state, action) => {
      const durationIncrement = Number.isFinite(action.payload) ? action.payload : 0;
      state.duration = (Number.isFinite(state.duration) ? state.duration : 0) + durationIncrement;
      state.durationAtLastLocation =
        (Number.isFinite(state.durationAtLastLocation) ? state.durationAtLastLocation : 0) + durationIncrement;
      state.durationTimerBase =
        (Number.isFinite(state.durationTimerBase) ? state.durationTimerBase : 0) + durationIncrement;
      state.durationTimerStartedAt = null;
    },
    setDurationAt: (state, action) => {
      state.duration = Math.max(0, Number.isFinite(action.payload) ? action.payload : 0);
    },
    startDurationTimer: (state, action) => {
      state.durationTimerBase = Number.isFinite(state.duration) ? state.duration : 0;
      state.durationTimerStartedAt = action.payload;
    },
    stopDurationTimer: (state) => {
      state.durationTimerBase = Number.isFinite(state.duration) ? state.duration : 0;
      state.durationTimerStartedAt = null;
    },
    syncDurationFromLocation: (state, action) => {
      const { duration, syncedAt } = action.payload;
      state.duration = Math.max(0, duration);
      state.durationAtLastLocation = Math.max(0, duration);
      state.durationTimerBase = Math.max(0, duration);
      state.durationTimerStartedAt = syncedAt;
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
      if (state.locationsWithPauses?.length === 0) {
        state.locationsWithPauses = [...state.locationsWithPauses, []];
      }
      state.locationsWithPauses[state.locationsWithPauses.length - 1].push(action.payload);
    },
    setLastPosition: (state, action) => {
      state.lastPosition = action.payload;
    },
    setIsTooMuchSpeed: (state, action) => {
      state.isTooMuchSpeed = action.payload;
    },
    setTooMuchSpeed: (state, action) => {
      state.tooMuchSpeed = action.payload;
    },
    setTooMuchSpeedTimestamp: (state, action) => {
      state.tooMuchSpeedTimestamp = action.payload;
    },
    resetLocationsFromBackground: (state) => {
      state.locationsFromBackground = [];
      state.duration = 0;
      state.distance = 0;
      state.steps = 0;
      state.isMapVisible = true;
      state.durationWithPauses = 0;
      state.durationAtLastLocation = 0;
      state.durationTimerBase = 0;
      state.durationTimerStartedAt = null;
      state.altitude = 0;
      state.kilometresSplit = [];
      state.currentPace = 0;
      state.lastKilometer = 0;
      state.lastKilometerDuration = 0;
      state.lastKilometerAltitude = 0;
      state.lastPosition = null;
      state.locationsWithPauses = [];
      state.isAppShutedByPhone = false;
      state.isTooMuchSpeed = false;
      state.tooMuchSpeed = 0;
      state.tooMuchSpeedTimestamp = null;
    },
    resetLocationSlice: () => {
      return LOCATION_INITIAL_STATE;
    },
  },
});

export const {
  restoreLocationsFromJournal,
  restoreTrackingMetrics,
  setInitialLocation,
  setLocationsFromBackground,
  resetLocationsFromBackground,
  setDistance,
  setSteps,
  setDuration,
  setDurationAt,
  startDurationTimer,
  stopDurationTimer,
  syncDurationFromLocation,
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
  setLastPosition,
  setIsTooMuchSpeed,
  setTooMuchSpeed,
  setTooMuchSpeedTimestamp,
  resetLocationSlice,
} = location.actions;

export default location.reducer;
