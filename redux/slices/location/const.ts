import { STATUSES } from '@const/enums';
import type { LocationInitialState } from './types';

export const LOCATION_INITIAL_STATE: LocationInitialState = {
  activityStatus: STATUSES.initial,
  isTooMuchSpeed: false,
  tooMuchSpeed: 0,
  tooMuchSpeedTimestamp: null,
  isAppShutedByPhone: false,
  isMapVisible: true,
  initialLocation: null,
  distance: 0,
  steps: 0,
  duration: 0,
  durationAtLastLocation: 0,
  durationTimerBase: 0,
  durationTimerStartedAt: null,
  altitude: 0,
  lastKilometerAltitude: 0,
  lastKilometer: 0,
  lastKilometerDuration: 0,
  lastPosition: null,
  currentPace: 0,
  kilometresSplit: [],
  locationsWithPauses: [[]],
  locationsFromBackground: [],
};
