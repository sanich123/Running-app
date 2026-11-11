import type { LocationObject } from 'expo-location';

export interface PauseMarkerProps {
  location: LocationObject;
  isResume: boolean;
}
