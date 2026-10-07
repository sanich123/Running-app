import { requireOptionalNativeModule } from 'expo';

export type HealthStore = 'health-connect' | 'healthkit';
export type HealthAvailability = 'available' | 'not-supported' | 'provider-update-required';

export interface WatchWorkoutLocation {
  timestamp?: number;
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
}

export interface WatchWorkout {
  source: HealthStore;
  sourceActivityId: string;
  date: string;
  timeZone: string;
  title?: string;
  sport: string;
  duration: number;
  distance: number;
  steps?: number;
  locations: WatchWorkoutLocation[];
}

export interface HealthPermissionsResult {
  available: boolean;
  granted: boolean;
}

interface RunichHealthNativeModule {
  getAvailability(): Promise<HealthAvailability>;
  getPermissions(): Promise<HealthPermissionsResult>;
  requestPermissions(): Promise<HealthPermissionsResult>;
  readWorkouts(startDate: string, endDate: string): Promise<WatchWorkout[]>;
}

const nativeModule = requireOptionalNativeModule<RunichHealthNativeModule>('RunichHealth');

function unavailable<T>(method: string): Promise<T> {
  return Promise.reject(new Error(`RunichHealth.${method} недоступен на этой платформе`));
}

export const RunichHealth = {
  getAvailability(): Promise<HealthAvailability> {
    return nativeModule?.getAvailability() ?? Promise.resolve('not-supported');
  },
  getPermissions(): Promise<HealthPermissionsResult> {
    return nativeModule?.getPermissions() ?? Promise.resolve({ available: false, granted: false });
  },
  requestPermissions(): Promise<HealthPermissionsResult> {
    return nativeModule?.requestPermissions() ?? unavailable('requestPermissions');
  },
  readWorkouts(startDate: string, endDate: string): Promise<WatchWorkout[]> {
    return nativeModule?.readWorkouts(startDate, endDate) ?? unavailable('readWorkouts');
  },
};
