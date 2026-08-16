import type { STATUSES } from '@const/enums';
import type { LocationObject } from 'expo-location';

export interface LastKmSplit {
  lastKilometerDuration: number;
  kilometerPoint: LocationObject;
  lastKilometerAltitude: number;
}

export interface LocationInitialState {
  activityStatus: STATUSES;
  isTooMuchSpeed: boolean;
  tooMuchSpeed: number;
  tooMuchSpeedTimestamp: number | null;
  isAppShutedByPhone: boolean;
  isMapVisible: boolean;
  initialLocation: LocationObject | null;
  distance: number;
  duration: number;
  altitude: number;
  durationWithPauses: number;
  lastKilometerAltitude: number;
  lastKilometer: number;
  lastKilometerDuration: number;
  lastPosition: LocationObject | null;
  currentPace: number;
  kilometresSplit: LastKmSplit[];
  locationsWithPauses: LocationObject[][];
  locationsFromBackground: LocationObject[];
}
