import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MAX_ACTIVITY_LOCATIONS } from '@U/location/const';
import { LOCATION_INITIAL_STATE } from './const';
import type { LocationSamplePayload } from './types';
import type { TrackingRecoveryMetrics } from '@R/slices/tracking-recovery/types';
import type { LocationObject } from 'expo-location';

function appendToLocationPreview(segment: LocationObject[], currentPosition: LocationObject) {
  const nextLength = segment.length + 1;
  if (nextLength <= MAX_ACTIVITY_LOCATIONS) {
    segment.push(currentPosition);
    return;
  }

  const reducedSegment = Array.from({ length: MAX_ACTIVITY_LOCATIONS }, (_, index) => {
    const sourceIndex = Math.round((index * (nextLength - 1)) / (MAX_ACTIVITY_LOCATIONS - 1));
    return sourceIndex < segment.length ? segment[sourceIndex]! : currentPosition;
  });
  segment.splice(0, segment.length, ...reducedSegment);
}

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
    setLocationProvider: (state, action) => {
      state.locationProvider = action.payload;
    },
    setLocationsFromBackground: (state, action) => {
      state.locationsFromBackground.push(action.payload);
    },
    recordLocationSample: (state, action: PayloadAction<LocationSamplePayload>) => {
      const {
        currentPosition,
        currentDistance,
        currentAltitude,
        currentPace,
        synchronizedDuration,
        syncedAt,
        kilometreSplits,
        remainingKilometreDistance,
        remainingKilometreDuration,
        remainingKilometreAltitude,
      } = action.payload;

      state.duration = Math.max(0, synchronizedDuration);
      state.durationAtLastLocation = state.duration;
      state.durationTimerBase = state.duration;
      state.durationTimerStartedAt = syncedAt;
      state.distance += currentDistance;
      state.currentPace = currentPace;
      state.altitude += currentAltitude;
      state.lastKilometer = remainingKilometreDistance;
      state.lastKilometerDuration = remainingKilometreDuration;
      state.lastKilometerAltitude = remainingKilometreAltitude;
      for (const { kilometerPoint, lastKilometerDuration, lastKilometerAltitude } of kilometreSplits) {
        if (!kilometerPoint) continue;
        state.kilometresSplit.push({
          kilometerPoint: kilometerPoint as LocationObject,
          lastKilometerDuration,
          lastKilometerAltitude,
        });
      }

      if (state.locationsWithPauses.length === 0) state.locationsWithPauses.push([]);
      appendToLocationPreview(state.locationsWithPauses[state.locationsWithPauses.length - 1]!, currentPosition);
      state.lastPosition = currentPosition;
      state.isTooMuchSpeed = false;
      state.tooMuchSpeed = 0;
      state.tooMuchSpeedTimestamp = null;
    },
    setTooMuchSpeedDetails: (state, action: PayloadAction<{ speed: number; timestamp: number }>) => {
      state.isTooMuchSpeed = true;
      state.tooMuchSpeed = action.payload.speed;
      state.tooMuchSpeedTimestamp = action.payload.timestamp;
    },
    setDistance: (state, action) => {
      state.distance = state.distance + action.payload;
    },
    setSteps: (state, action) => {
      state.steps = action.payload;
    },
    setDurationAt: (state, action) => {
      state.duration = Math.max(0, Number.isFinite(action.payload) ? action.payload : 0);
    },
    startDurationTimer: (state, action) => {
      state.durationTimerBase = Number.isFinite(state.duration) ? state.duration : 0;
      state.durationTimerStartedAt = action.payload;
    },
    setActivityStartContext: (state, action: PayloadAction<{ startedAt: number; timeZone: string }>) => {
      state.recordingStartedAt = action.payload.startedAt;
      state.recordingTimeZone = action.payload.timeZone;
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
    setNavigationTrackId: (state, action: PayloadAction<string | null>) => {
      state.navigationTrackId = action.payload;
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
      state.locationProvider = null;
      state.durationAtLastLocation = 0;
      state.durationTimerBase = 0;
      state.durationTimerStartedAt = null;
      state.recordingStartedAt = null;
      state.recordingTimeZone = null;
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
  },
});

export const {
  restoreLocationsFromJournal,
  restoreTrackingMetrics,
  setInitialLocation,
  setLocationProvider,
  setLocationsFromBackground,
  recordLocationSample,
  setTooMuchSpeedDetails,
  resetLocationsFromBackground,
  setDistance,
  setSteps,
  setDurationAt,
  startDurationTimer,
  setActivityStartContext,
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
  setLastPosition,
  setNavigationTrackId,
  setIsTooMuchSpeed,
  setTooMuchSpeed,
  setTooMuchSpeedTimestamp,
} = location.actions;

export default location.reducer;
