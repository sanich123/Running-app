import type { STATUSES } from '@const/enums';
import type { LocationProvider } from '@U/location/location-provider';
import type { LocationObject } from 'expo-location';

export interface LastKmSplit {
  lastKilometerDuration: number;
  kilometerPoint: LocationObject;
  lastKilometerAltitude: number;
  lastKilometerSteps?: number;
}

export interface LocationInitialState {
  activityStatus: STATUSES;
  isTooMuchSpeed: boolean;
  tooMuchSpeed: number;
  tooMuchSpeedTimestamp: number | null;
  isAppShutedByPhone: boolean;
  isMapVisible: boolean;
  locationProvider: LocationProvider | null;
  initialLocation: LocationObject | null;
  distance: number;
  steps: number;
  duration: number;
  durationAtLastLocation: number;
  durationTimerBase: number;
  durationTimerStartedAt: number | null;
  recordingStartedAt: number | null;
  recordingTimeZone: string | null;
  altitude: number;
  lastKilometerAltitude: number;
  lastKilometer: number;
  lastKilometerDuration: number;
  lastPosition: LocationObject | null;
  currentPace: number;
  kilometresSplit: LastKmSplit[];
  locationsWithPauses: LocationObject[][];
  locationsFromBackground: LocationObject[];
  navigationTrackId: string | null;
}
