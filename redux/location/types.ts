import { STATUSES } from '@const/enums';
import { LocationObject } from 'expo-location';

export type LastKmSplit = {
  lastKilometerDuration: number;
  kilometerPoint: LocationObject;
  lastKilometerAltitude: number;
};

export type LocationInitialState = {
  activityStatus: STATUSES;
  isTooMuchSpeed: boolean;
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
};
