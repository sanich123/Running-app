import { requireOptionalNativeModule } from 'expo';
import {
  ExerciseType,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  readRecords,
  requestExerciseRoute,
  requestPermission,
  SdkAvailabilityStatus,
  type Permission,
  type ReadRecordsOptions,
  type RecordResult,
  type RecordType,
} from 'react-native-health-connect';
import { Platform } from 'react-native';

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
  date: string;
  timeZone: string;
  title?: string;
  sport: string;
  duration: number;
  distance: number;
  steps?: number;
  locations: WatchWorkoutLocation[];
  diagnostics?: WatchWorkoutDiagnostics;
}

export type WatchWorkoutRouteStatus =
  | 'route-in-record'
  | 'no-route-data'
  | 'route-not-provided'
  | 'consent-granted'
  | 'consent-granted-empty'
  | 'consent-denied-or-error';

export type HealthConnectReadStage =
  'availability' | 'exercise-sessions' | 'distance-and-steps' | 'exercise-route' | 'complete';

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

export interface WatchWorkoutDiagnostics {
  dataOrigin?: string;
  sessionRecordId?: string;
  routeStatus: WatchWorkoutRouteStatus;
  routePointCount: number;
  routeErrorCode?: string;
}

export interface HealthPermissionsResult {
  available: boolean;
  granted: boolean;
  details?: {
    exerciseSession: boolean;
    distance: boolean;
    steps: boolean;
  };
}

interface RunichHealthNativeModule {
  getAvailability(): Promise<HealthAvailability>;
  getPermissions(): Promise<HealthPermissionsResult>;
  requestPermissions(): Promise<HealthPermissionsResult>;
  readWorkouts(startDate: string, endDate: string): Promise<WatchWorkout[]>;
}

const REQUIRED_ANDROID_PERMISSIONS = [
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'Steps' },
] satisfies Permission[];

const nativeModule =
  Platform.OS === 'ios' ? requireOptionalNativeModule<RunichHealthNativeModule>('RunichHealth') : null;
let pendingAndroidAvailability: Promise<HealthAvailability> | null = null;
// ExerciseRouteResultType values from Android Health Connect.
const EXERCISE_ROUTE_DATA = 0;
const EXERCISE_ROUTE_NO_DATA = 1;
const EXERCISE_ROUTE_CONSENT_REQUIRED = 2;

async function resolveAndroidAvailability(): Promise<HealthAvailability> {
  if (Platform.OS !== 'android') return 'not-supported';
  if (Number(Platform.Version) < 28) return 'not-supported';

  const status = await getSdkStatus();
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return 'provider-update-required';
  if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) return 'provider-not-available';

  return (await initialize()) ? 'available' : 'provider-not-available';
}

function getAndroidAvailability(): Promise<HealthAvailability> {
  if (!pendingAndroidAvailability) pendingAndroidAvailability = resolveAndroidAvailability();
  const availability = pendingAndroidAvailability;
  return availability.finally(() => {
    if (pendingAndroidAvailability === availability) pendingAndroidAvailability = null;
  });
}

function getAndroidPermissionDetails(grantedPermissions: Awaited<ReturnType<typeof getGrantedPermissions>>) {
  return {
    exerciseSession: grantedPermissions.some(
      (granted) => granted.accessType === 'read' && granted.recordType === 'ExerciseSession',
    ),
    distance: grantedPermissions.some((granted) => granted.accessType === 'read' && granted.recordType === 'Distance'),
    steps: grantedPermissions.some((granted) => granted.accessType === 'read' && granted.recordType === 'Steps'),
  };
}

async function getAndroidPermissions(): Promise<HealthPermissionsResult> {
  const available = (await getAndroidAvailability()) === 'available';
  if (!available) return { available: false, granted: false };

  const details = getAndroidPermissionDetails(await getGrantedPermissions());
  return { available: true, granted: Object.values(details).every(Boolean), details };
}

function getDiagnosticErrorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return 'UnknownError';
  if ('code' in error && typeof error.code === 'string') return error.code;
  if ('name' in error && typeof error.name === 'string') return error.name;
  return 'UnknownError';
}

async function readAllRecords<T extends RecordType>(
  recordType: T,
  options: ReadRecordsOptions,
): Promise<RecordResult<T>[]> {
  const records: RecordResult<T>[] = [];
  let pageToken: string | undefined;

  do {
    const page = await readRecords(recordType, { ...options, pageSize: 1000, pageToken });
    records.push(...page.records);
    pageToken = page.pageToken;
  } while (pageToken);

  return records;
}

function mapSport(exerciseType: number): string {
  switch (exerciseType) {
    case ExerciseType.RUNNING:
    case ExerciseType.RUNNING_TREADMILL:
      return 'run';
    case ExerciseType.BIKING:
    case ExerciseType.BIKING_STATIONARY:
      return 'bike';
    case ExerciseType.WALKING:
      return 'walk';
    case ExerciseType.HIKING:
      return 'hike';
    case ExerciseType.SWIMMING_POOL:
    case ExerciseType.SWIMMING_OPEN_WATER:
      return 'swim';
    default:
      return 'workout';
  }
}

function getLengthInMeters(length: unknown): number | undefined {
  if (typeof length !== 'object' || length === null) return undefined;
  if ('inMeters' in length && typeof length.inMeters === 'number') return length.inMeters;
  if (!('value' in length) || typeof length.value !== 'number' || !('unit' in length)) return undefined;

  const metersPerUnit: Record<string, number> = {
    meters: 1,
    kilometers: 1000,
    miles: 1609.344,
    inches: 0.0254,
    feet: 0.3048,
  };
  const multiplier = typeof length.unit === 'string' ? metersPerUnit[length.unit] : undefined;
  return multiplier === undefined ? undefined : length.value * multiplier;
}

function mapRouteLocation(location: Awaited<ReturnType<typeof requestExerciseRoute>>[number]): WatchWorkoutLocation {
  return {
    timestamp: Date.parse(location.time),
    coords: {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: getLengthInMeters(location.altitude),
      accuracy: getLengthInMeters(location.horizontalAccuracy),
    },
  };
}

async function readAndroidWorkouts(
  startDate: string,
  endDate: string,
  onProgress: (progress: HealthConnectReadProgress) => void = () => undefined,
): Promise<WatchWorkout[]> {
  onProgress({ stage: 'availability' });
  if ((await getAndroidAvailability()) !== 'available') throw new Error('Health Connect недоступен');

  onProgress({ stage: 'exercise-sessions' });
  const sessions = await readAllRecords('ExerciseSession', {
    timeRangeFilter: { operator: 'between', startTime: startDate, endTime: endDate },
  });
  const workouts: WatchWorkout[] = [];
  onProgress({
    stage: sessions.length > 0 ? 'distance-and-steps' : 'complete',
    sessionCount: sessions.length,
    processedSessionCount: 0,
  });

  for (const session of sessions) {
    onProgress({
      stage: 'distance-and-steps',
      sessionCount: sessions.length,
      processedSessionCount: workouts.length,
    });
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime: session.startTime,
      endTime: session.endTime,
    };
    const sourceFilter = session.metadata?.dataOrigin ? { dataOriginFilter: [session.metadata.dataOrigin] } : {};
    const [distanceRecords, stepRecords] = await Promise.all([
      readAllRecords('Distance', { timeRangeFilter, ...sourceFilter }),
      readAllRecords('Steps', { timeRangeFilter, ...sourceFilter }),
    ]);

    let route = session.exerciseRoute?.route ?? [];
    let routeStatus: WatchWorkoutRouteStatus = route.length > 0 ? 'route-in-record' : 'route-not-provided';
    let routeErrorCode: string | undefined;

    if (session.exerciseRoute?.type === EXERCISE_ROUTE_DATA) {
      routeStatus = route.length > 0 ? 'route-in-record' : 'route-not-provided';
    } else if (session.exerciseRoute?.type === EXERCISE_ROUTE_NO_DATA) {
      route = [];
      routeStatus = 'no-route-data';
    }

    if (session.exerciseRoute?.type === EXERCISE_ROUTE_CONSENT_REQUIRED && session.metadata?.id) {
      onProgress({
        stage: 'exercise-route',
        sessionCount: sessions.length,
        processedSessionCount: workouts.length,
      });
      try {
        route = await requestExerciseRoute(session.metadata.id);
        routeStatus = route.length > 0 ? 'consent-granted' : 'consent-granted-empty';
      } catch (routeError) {
        route = [];
        routeStatus = 'consent-denied-or-error';
        // Keep only a stable error code/name for local debugging; do not expose coordinates or raw native details.
        routeErrorCode = getDiagnosticErrorCode(routeError);
      }
    }

    const duration = Date.parse(session.endTime) - Date.parse(session.startTime);
    const distance = distanceRecords.reduce((total, record) => total + (getLengthInMeters(record.distance) ?? 0), 0);
    const steps = stepRecords.reduce((total, record) => total + record.count, 0);
    const fallbackId = `${session.startTime}:${session.endTime}:${session.exerciseType}`;
    const workout: WatchWorkout = {
      source: 'health-connect',
      sourceActivityId: session.metadata?.id ?? fallbackId,
      date: session.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      sport: mapSport(session.exerciseType),
      duration: Math.max(0, duration),
      distance: Math.max(0, distance),
      locations: route.map(mapRouteLocation),
      diagnostics: {
        dataOrigin: session.metadata?.dataOrigin,
        sessionRecordId: session.metadata?.id,
        routeStatus,
        routePointCount: route.length,
        ...(routeErrorCode ? { routeErrorCode } : {}),
      },
    };

    if (session.title?.trim()) workout.title = session.title;
    if (steps > 0) workout.steps = steps;
    workouts.push(workout);
    onProgress({
      stage: workouts.length === sessions.length ? 'complete' : 'distance-and-steps',
      sessionCount: sessions.length,
      processedSessionCount: workouts.length,
    });
  }

  return workouts;
}

function unavailable<T>(method: string): Promise<T> {
  return Promise.reject(new Error(`RunichHealth.${method} недоступен на этой платформе`));
}

export const RunichHealth = {
  getAvailability(): Promise<HealthAvailability> {
    if (Platform.OS === 'android') return getAndroidAvailability();
    return nativeModule?.getAvailability() ?? Promise.resolve('not-supported');
  },
  getPermissions(): Promise<HealthPermissionsResult> {
    if (Platform.OS === 'android') return getAndroidPermissions();
    return nativeModule?.getPermissions() ?? Promise.resolve({ available: false, granted: false });
  },
  async requestPermissions(): Promise<HealthPermissionsResult> {
    if (Platform.OS === 'android') {
      const available = (await getAndroidAvailability()) === 'available';
      if (!available) return { available: false, granted: false };

      await requestPermission(REQUIRED_ANDROID_PERMISSIONS);
      return getAndroidPermissions();
    }
    return nativeModule?.requestPermissions() ?? unavailable('requestPermissions');
  },
  readWorkouts(
    startDate: string,
    endDate: string,
    onProgress?: (progress: HealthConnectReadProgress) => void,
  ): Promise<WatchWorkout[]> {
    if (Platform.OS === 'android') {
      let stage: HealthConnectReadStage = 'availability';
      return readAndroidWorkouts(startDate, endDate, (progress) => {
        stage = progress.stage;
        onProgress?.(progress);
      }).catch((error: unknown) => {
        if (error instanceof HealthConnectReadError) throw error;
        throw new HealthConnectReadError(stage, getDiagnosticErrorCode(error));
      });
    }
    onProgress?.({ stage: 'availability' });
    return (nativeModule?.readWorkouts(startDate, endDate) ?? unavailable<WatchWorkout[]>('readWorkouts')).then(
      (workouts) => {
        onProgress?.({ stage: 'complete', sessionCount: workouts.length, processedSessionCount: workouts.length });
        return workouts;
      },
    );
  },
};
