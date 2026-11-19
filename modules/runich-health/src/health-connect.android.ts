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
import {
  type HealthAvailability,
  type HealthConnectReadProgress,
  type HealthPermissionsResult,
  type WatchWorkout,
  type WatchWorkoutLocation,
  type WatchWorkoutRouteStatus,
} from './types';

const ANDROID_PERMISSIONS_TO_REQUEST = [
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
] satisfies Permission[];

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

export function getAndroidAvailability(): Promise<HealthAvailability> {
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
    heartRate: grantedPermissions.some(
      (granted) => granted.accessType === 'read' && granted.recordType === 'HeartRate',
    ),
    activeCalories: grantedPermissions.some(
      (granted) => granted.accessType === 'read' && granted.recordType === 'ActiveCaloriesBurned',
    ),
  };
}

export async function getAndroidPermissions(): Promise<HealthPermissionsResult> {
  const available = (await getAndroidAvailability()) === 'available';
  if (!available) return { available: false, granted: false };

  const details = getAndroidPermissionDetails(await getGrantedPermissions());
  return {
    available: true,
    granted: details.exerciseSession && details.distance && details.steps,
    details,
  };
}

export function getDiagnosticErrorCode(error: unknown): string {
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

const HEALTH_CONNECT_SOURCE_APPS = [
  ['healthsync', 'Health Sync'],
  ['suunto', 'Suunto'],
  ['garmin', 'Garmin Connect'],
  ['polar', 'Polar Flow'],
  ['strava', 'Strava'],
  ['fitbit', 'Fitbit'],
  ['shealth', 'Samsung Health'],
  ['samsunghealth', 'Samsung Health'],
  ['oura', 'Oura'],
  ['zepp', 'Zepp'],
] as const;

function getHealthConnectSourceAppName(dataOrigin?: string): string | undefined {
  if (!dataOrigin) return undefined;
  const normalizedOrigin = dataOrigin.toLowerCase();
  return HEALTH_CONNECT_SOURCE_APPS.find(([packageHint]) => normalizedOrigin.includes(packageHint))?.[1] ?? dataOrigin;
}

export async function readAndroidWorkouts(
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
  const permissionDetails = getAndroidPermissionDetails(await getGrantedPermissions());
  const heartRatePermissionGranted = permissionDetails.heartRate;
  const activeCaloriesPermissionGranted = permissionDetails.activeCalories;
  const workouts: WatchWorkout[] = [];
  onProgress({
    stage: sessions.length > 0 ? 'workout-measurements' : 'complete',
    sessionCount: sessions.length,
    processedSessionCount: 0,
  });

  for (const session of sessions) {
    onProgress({
      stage: 'workout-measurements',
      sessionCount: sessions.length,
      processedSessionCount: workouts.length,
    });
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime: session.startTime,
      endTime: session.endTime,
    };
    const sourceFilter = session.metadata?.dataOrigin ? { dataOriginFilter: [session.metadata.dataOrigin] } : {};
    const [distanceRecords, stepRecords, matchingHeartRateRecords, activeCaloriesRecords] = await Promise.all([
      readAllRecords('Distance', { timeRangeFilter, ...sourceFilter }),
      readAllRecords('Steps', { timeRangeFilter, ...sourceFilter }),
      heartRatePermissionGranted
        ? readAllRecords('HeartRate', { timeRangeFilter, ...sourceFilter })
        : Promise.resolve([]),
      activeCaloriesPermissionGranted
        ? readAllRecords('ActiveCaloriesBurned', { timeRangeFilter, ...sourceFilter })
        : Promise.resolve([]),
    ]);
    const sessionStart = Date.parse(session.startTime);
    const sessionEnd = Date.parse(session.endTime);
    const getSessionHeartRateSamples = (records: RecordResult<'HeartRate'>[]) => {
      const seenHeartRateSamples = new Set<string>();
      return records
        .flatMap(({ samples }) => samples)
        .map(({ time, beatsPerMinute }) => ({ timestamp: Date.parse(time), beatsPerMinute }))
        .filter(({ timestamp, beatsPerMinute }) => {
          if (
            !Number.isFinite(timestamp) ||
            timestamp < sessionStart ||
            timestamp > sessionEnd ||
            !Number.isFinite(beatsPerMinute) ||
            beatsPerMinute < 1 ||
            beatsPerMinute > 300
          ) {
            return false;
          }

          const key = `${timestamp}:${beatsPerMinute}`;
          if (seenHeartRateSamples.has(key)) return false;
          seenHeartRateSamples.add(key);
          return true;
        })
        .sort((first, second) => first.timestamp - second.timestamp);
    };
    let heartRateSamples = getSessionHeartRateSamples(matchingHeartRateRecords);
    if (heartRatePermissionGranted && heartRateSamples.length === 0 && session.metadata?.dataOrigin) {
      const heartRateRecords = await readAllRecords('HeartRate', { timeRangeFilter });
      heartRateSamples = getSessionHeartRateSamples(heartRateRecords);
    }

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
    const caloriesActive = activeCaloriesRecords.reduce((total, record) => {
      const calories = record.energy?.inKilocalories;
      return typeof calories === 'number' && Number.isFinite(calories) && calories >= 0 ? total + calories : total;
    }, 0);
    const fallbackId = `${session.startTime}:${session.endTime}:${session.exerciseType}`;
    const dataOrigin = session.metadata?.dataOrigin;
    const sourceAppName = getHealthConnectSourceAppName(dataOrigin);
    const recordingDeviceManufacturer = session.metadata?.device?.manufacturer?.trim();
    const recordingDeviceModel = session.metadata?.device?.model?.trim();
    const workout: WatchWorkout = {
      source: 'health-connect',
      sourceActivityId: session.metadata?.id ?? fallbackId,
      ...(sourceAppName ? { sourceAppName } : {}),
      ...(recordingDeviceManufacturer ? { recordingDeviceManufacturer } : {}),
      ...(recordingDeviceModel ? { recordingDeviceModel } : {}),
      date: session.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      sport: mapSport(session.exerciseType),
      duration: Math.max(0, duration),
      distance: Math.max(0, distance),
      locations: route.map(mapRouteLocation),
      diagnostics: {
        dataOrigin,
        sessionRecordId: session.metadata?.id,
        routeStatus,
        routePointCount: route.length,
        heartRatePermissionGranted,
        heartRateSampleCount: heartRateSamples.length,
        activeCaloriesPermissionGranted,
        activeCaloriesRecordCount: activeCaloriesRecords.length,
        ...(routeErrorCode ? { routeErrorCode } : {}),
      },
    };

    if (session.title?.trim()) workout.title = session.title;
    if (steps > 0) workout.steps = steps;
    if (heartRateSamples.length > 0) workout.heartRateSamples = heartRateSamples;
    if (activeCaloriesRecords.length > 0 && Number.isFinite(caloriesActive)) {
      workout.caloriesActive = Math.round(caloriesActive);
    }
    workouts.push(workout);
    onProgress({
      stage: workouts.length === sessions.length ? 'complete' : 'workout-measurements',
      sessionCount: sessions.length,
      processedSessionCount: workouts.length,
    });
  }

  return workouts;
}

export async function requestAndroidPermissions(): Promise<HealthPermissionsResult> {
  const available = (await getAndroidAvailability()) === 'available';
  if (!available) return { available: false, granted: false };

  await requestPermission(ANDROID_PERMISSIONS_TO_REQUEST);
  return getAndroidPermissions();
}
