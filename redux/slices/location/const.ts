import { STATUSES } from '@const/enums';

import { LocationInitialState } from './types';

export const LOCATION_INITIAL_STATE: LocationInitialState = {
  activityStatus: STATUSES.initial,
  isTooMuchSpeed: false,
  isAppShutedByPhone: false,
  isMapVisible: true,
  initialLocation: null,
  distance: 0,
  duration: 0,
  durationWithPauses: 0,
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
