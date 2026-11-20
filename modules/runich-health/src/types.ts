import type { ActivityHeartRateSample } from '@S/card/types';

export type HealthStore = 'health-connect' | 'healthkit';
export type HealthAvailability = 'available' | 'not-supported' | 'provider-not-available' | 'provider-update-required';

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
  sourceAppName?: string;
  recordingDeviceManufacturer?: string;
  recordingDeviceModel?: string;
  date: string;
  timeZone: string;
  title?: string;
  sport: string;
  duration: number;
  distance: number;
  steps?: number;
  heartRateSamples?: ActivityHeartRateSample[];
  caloriesActive?: number;
  locations: WatchWorkoutLocation[];
  diagnostics?: WatchWorkoutDiagnostics;
}

export type WatchWorkoutRouteStatus =
  | 'route-in-record'
  | 'no-route-data'
  | 'route-not-provided'
  | 'consent-granted'
  | 'consent-granted-empty'
  | 'consent-denied-or-error'
  | 'route-read-error';

export type HealthConnectReadStage =
  'availability' | 'exercise-sessions' | 'workout-measurements' | 'exercise-route' | 'complete';

export interface HealthConnectReadProgress {
  stage: HealthConnectReadStage;
  sessionCount?: number;
  processedSessionCount?: number;
}

export class HealthConnectReadError extends Error {
  constructor(
    readonly stage: HealthConnectReadStage,
    readonly errorCode: string,
  ) {
    super(`Health Connect read failed during ${stage}`);
    this.name = 'HealthConnectReadError';
  }
}

interface WatchWorkoutDiagnostics {
  dataOrigin?: string;
  sessionRecordId?: string;
  routeStatus: WatchWorkoutRouteStatus;
  routePointCount: number;
  heartRatePermissionGranted?: boolean;
  heartRateSampleCount?: number;
  activeCaloriesPermissionGranted?: boolean;
  activeCaloriesRecordCount?: number;
  routeErrorCode?: string;
  heartRateErrorCode?: string;
}

export interface HealthPermissionsResult {
  available: boolean;
  granted?: boolean;
  details?: {
    exerciseSession?: boolean;
    distance?: boolean;
    steps?: boolean;
    heartRate?: boolean;
    activeCalories?: boolean;
  };
}
