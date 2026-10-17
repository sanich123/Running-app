const mockPlatform = { os: 'android', version: 35 };
const mockRequireOptionalNativeModule = jest.fn();
const mockGetSdkStatus = jest.fn();
const mockInitialize = jest.fn();
const mockGetGrantedPermissions = jest.fn();
const mockRequestPermission = jest.fn();
const mockReadRecords = jest.fn();
const mockRequestExerciseRoute = jest.fn();

jest.mock('react-native', () => {
  return {
    Platform: {
      get OS() {
        return mockPlatform.os;
      },
      get Version() {
        return mockPlatform.version;
      },
    },
  };
});

jest.mock('expo', () => ({ requireOptionalNativeModule: mockRequireOptionalNativeModule }));
jest.mock('react-native-health-connect', () => ({
  ExerciseType: {
    RUNNING: 1,
    RUNNING_TREADMILL: 2,
    BIKING: 3,
    BIKING_STATIONARY: 4,
    WALKING: 5,
    HIKING: 6,
    SWIMMING_POOL: 7,
    SWIMMING_OPEN_WATER: 8,
  },
  SdkAvailabilityStatus: {
    SDK_AVAILABLE: 'available',
    SDK_UNAVAILABLE: 'unavailable',
    SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: 'update-required',
  },
  getGrantedPermissions: mockGetGrantedPermissions,
  getSdkStatus: mockGetSdkStatus,
  initialize: mockInitialize,
  readRecords: mockReadRecords,
  requestExerciseRoute: mockRequestExerciseRoute,
  requestPermission: mockRequestPermission,
}));

import type {
  HealthAvailability,
  HealthConnectReadProgress,
  HealthConnectReadStage,
  HealthPermissionsResult,
  WatchWorkout,
} from './RunichHealth';

interface RunichHealthClient {
  getAvailability(): Promise<HealthAvailability>;
  getPermissions(): Promise<HealthPermissionsResult>;
  requestPermissions(): Promise<HealthPermissionsResult>;
  readWorkouts(
    startDate: string,
    endDate: string,
    onProgress?: (progress: HealthConnectReadProgress) => void,
  ): Promise<WatchWorkout[]>;
}

interface RunichHealthModule {
  HealthConnectReadError: new (stage: HealthConnectReadStage, errorCode: string) => Error;
  RunichHealth: RunichHealthClient;
}

function loadHealth(os = 'android', version = 35, nativeModule: unknown = null): RunichHealthModule {
  jest.resetModules();
  mockPlatform.os = os;
  mockPlatform.version = version;
  mockRequireOptionalNativeModule.mockReturnValue(nativeModule);
  return require('./RunichHealth') as RunichHealthModule;
}

function getHealthConnectModule() {
  return require('react-native-health-connect') as {
    ExerciseType: Record<string, number>;
    SdkAvailabilityStatus: Record<string, string>;
  };
}

function makeSession(exerciseType: number, overrides: Record<string, unknown> = {}) {
  return {
    startTime: '2026-10-08T07:00:00.000Z',
    endTime: '2026-10-08T08:00:00.000Z',
    exerciseType,
    metadata: { id: 'record-1', dataOrigin: 'com.example.watch' },
    title: ' Morning run ',
    exerciseRoute: { type: 0, route: [] },
    ...overrides,
  };
}

describe('RunichHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatform.os = 'android';
    mockPlatform.version = 35;
    mockGetSdkStatus.mockResolvedValue(getHealthConnectModule().SdkAvailabilityStatus.SDK_AVAILABLE);
    mockInitialize.mockResolvedValue(true);
    mockGetGrantedPermissions.mockResolvedValue([]);
    mockRequestPermission.mockResolvedValue(undefined);
  });

  it('resolves and caches Android availability while the native request is pending', async () => {
    const health = loadHealth();
    let resolveSdkStatus!: (status: string) => void;
    mockGetSdkStatus.mockReturnValue(
      new Promise((resolve) => {
        resolveSdkStatus = resolve;
      }),
    );

    const first = health.RunichHealth.getAvailability();
    const second = health.RunichHealth.getAvailability();

    resolveSdkStatus(getHealthConnectModule().SdkAvailabilityStatus.SDK_AVAILABLE);
    mockInitialize.mockResolvedValue(true);
    await expect(first).resolves.toBe('available');
    await expect(second).resolves.toBe('available');
    expect(mockGetSdkStatus).toHaveBeenCalledTimes(1);

    mockGetSdkStatus.mockResolvedValue(
      getHealthConnectModule().SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED,
    );
    await expect(health.RunichHealth.getAvailability()).resolves.toBe('provider-update-required');
    mockGetSdkStatus.mockResolvedValue(getHealthConnectModule().SdkAvailabilityStatus.SDK_UNAVAILABLE);
    await expect(health.RunichHealth.getAvailability()).resolves.toBe('provider-not-available');
    mockInitialize.mockResolvedValue(false);
    mockGetSdkStatus.mockResolvedValue(getHealthConnectModule().SdkAvailabilityStatus.SDK_AVAILABLE);
    await expect(health.RunichHealth.getAvailability()).resolves.toBe('provider-not-available');

    mockPlatform.version = 27;
    await expect(health.RunichHealth.getAvailability()).resolves.toBe('not-supported');
  });

  it('reports Android permissions for unavailable, partial, and complete access', async () => {
    const health = loadHealth();
    mockGetSdkStatus.mockResolvedValue(getHealthConnectModule().SdkAvailabilityStatus.SDK_UNAVAILABLE);
    await expect(health.RunichHealth.getPermissions()).resolves.toEqual({ available: false, granted: false });

    mockGetSdkStatus.mockResolvedValue(getHealthConnectModule().SdkAvailabilityStatus.SDK_AVAILABLE);
    mockGetGrantedPermissions.mockResolvedValue([
      { accessType: 'read', recordType: 'ExerciseSession' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
    ]);
    await expect(health.RunichHealth.getPermissions()).resolves.toEqual({
      available: true,
      granted: true,
      details: { exerciseSession: true, distance: true, steps: true, heartRate: true },
    });

    mockGetGrantedPermissions.mockResolvedValue([{ accessType: 'write', recordType: 'Distance' }]);
    await expect(health.RunichHealth.getPermissions()).resolves.toEqual({
      available: true,
      granted: false,
      details: { exerciseSession: false, distance: false, steps: false, heartRate: false },
    });
  });

  it('requests Android permissions only when Health Connect is available', async () => {
    const health = loadHealth();
    mockGetSdkStatus.mockResolvedValue(getHealthConnectModule().SdkAvailabilityStatus.SDK_UNAVAILABLE);
    await expect(health.RunichHealth.requestPermissions()).resolves.toEqual({ available: false, granted: false });
    expect(mockRequestPermission).not.toHaveBeenCalled();

    mockGetSdkStatus.mockResolvedValue(getHealthConnectModule().SdkAvailabilityStatus.SDK_AVAILABLE);
    mockGetGrantedPermissions.mockResolvedValue([
      { accessType: 'read', recordType: 'ExerciseSession' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
    ]);
    await expect(health.RunichHealth.requestPermissions()).resolves.toEqual({
      available: true,
      granted: true,
      details: { exerciseSession: true, distance: true, steps: true, heartRate: true },
    });
    expect(mockRequestPermission).toHaveBeenCalledWith([
      { accessType: 'read', recordType: 'ExerciseSession' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
    ]);
  });

  it('reads paginated workouts, maps sports and route diagnostics, and reports progress', async () => {
    const health = loadHealth();
    const { ExerciseType } = getHealthConnectModule();
    const routePoint = {
      time: '2026-10-08T07:30:00.000Z',
      latitude: 55.75,
      longitude: 37.61,
      altitude: { value: 1, unit: 'kilometers' },
      horizontalAccuracy: { value: 2, unit: 'feet' },
    };
    const sessions = [
      makeSession(ExerciseType.RUNNING, {
        exerciseRoute: { type: 0, route: [routePoint] },
        metadata: { id: 'record-running', dataOrigin: 'com.example.watch' },
      }),
      makeSession(ExerciseType.RUNNING_TREADMILL, {
        startTime: '2026-10-08T09:00:00.000Z',
        endTime: '2026-10-08T08:00:00.000Z',
        exerciseRoute: { type: 0, route: [] },
        metadata: {},
        title: '   ',
      }),
      makeSession(ExerciseType.BIKING, { exerciseRoute: { type: 1, route: [routePoint] } }),
      makeSession(ExerciseType.BIKING_STATIONARY, {
        exerciseRoute: { type: 2, route: [] },
        metadata: { id: 'consent-success' },
      }),
      makeSession(ExerciseType.WALKING, {
        exerciseRoute: { type: 2, route: [] },
        metadata: { id: 'consent-empty' },
      }),
      makeSession(ExerciseType.HIKING, {
        exerciseRoute: { type: 2, route: [] },
        metadata: { id: 'consent-code' },
      }),
      makeSession(ExerciseType.SWIMMING_POOL),
      makeSession(ExerciseType.SWIMMING_OPEN_WATER, { exerciseType: 999 }),
    ];
    const progress: string[] = [];

    mockReadRecords.mockImplementation(
      async (recordType: string, options: { pageToken?: string; timeRangeFilter: { startTime: string } }) => {
        const startTime = options.timeRangeFilter.startTime;
        if (recordType === 'ExerciseSession') {
          return options.pageToken
            ? { records: sessions.slice(1) }
            : { records: sessions.slice(0, 1), pageToken: 'sessions-page-2' };
        }
        if (startTime === sessions[0].startTime && recordType === 'Distance') {
          return options.pageToken
            ? {
                records: [
                  { distance: { value: 1, unit: 'kilometers' } },
                  { distance: { value: 1, unit: 'miles' } },
                  { distance: { value: 1, unit: 'inches' } },
                  { distance: { value: 1, unit: 'feet' } },
                  { distance: { value: 1, unit: 'unknown' } },
                  { distance: { value: 1, unit: 2 } },
                  { distance: { value: '1', unit: 'meters' } },
                  { distance: {} },
                  { distance: null },
                ],
              }
            : { records: [{ distance: { inMeters: 100 } }], pageToken: 'distance-page-2' };
        }
        if (startTime === sessions[1].startTime && recordType === 'Distance') {
          return { records: [{ distance: { value: -1, unit: 'meters' } }] };
        }
        if (recordType === 'Steps' && startTime === sessions[0].startTime) {
          return options.pageToken
            ? { records: [{ count: 2 }] }
            : { records: [{ count: 1 }], pageToken: 'steps-page-2' };
        }
        return { records: [] };
      },
    );
    mockRequestExerciseRoute.mockImplementation(async (id: string) => {
      if (id === 'consent-success') return [routePoint];
      if (id === 'consent-empty') return [];
      throw id === 'consent-code' ? { code: 'ROUTE_DENIED' } : new Error('unexpected route');
    });

    const workouts = await health.RunichHealth.readWorkouts(
      '2026-10-01T00:00:00.000Z',
      '2026-10-09T00:00:00.000Z',
      (item) => {
        progress.push(item.stage);
      },
    );

    expect(workouts).toHaveLength(8);
    expect(workouts.map(({ sport }) => sport)).toEqual([
      'run',
      'run',
      'bike',
      'bike',
      'walk',
      'hike',
      'swim',
      'workout',
    ]);
    expect(workouts[0]).toEqual(
      expect.objectContaining({
        sourceActivityId: 'record-running',
        title: ' Morning run ',
        distance: expect.any(Number),
        steps: 3,
        diagnostics: expect.objectContaining({ routeStatus: 'route-in-record', routePointCount: 1 }),
      }),
    );
    expect(workouts[1]).toEqual(
      expect.objectContaining({
        sourceActivityId: `${sessions[1].startTime}:${sessions[1].endTime}:${ExerciseType.RUNNING_TREADMILL}`,
        duration: 0,
        distance: 0,
        diagnostics: expect.objectContaining({ routeStatus: 'route-not-provided', routePointCount: 0 }),
      }),
    );
    expect(workouts[2].diagnostics).toEqual(expect.objectContaining({ routeStatus: 'no-route-data' }));
    expect(workouts[3].diagnostics).toEqual(
      expect.objectContaining({ routeStatus: 'consent-granted', routePointCount: 1 }),
    );
    expect(workouts[4].diagnostics).toEqual(expect.objectContaining({ routeStatus: 'consent-granted-empty' }));
    expect(workouts[5].diagnostics).toEqual(
      expect.objectContaining({ routeStatus: 'consent-denied-or-error', routeErrorCode: 'ROUTE_DENIED' }),
    );
    expect(progress).toContain('availability');
    expect(progress).toContain('exercise-sessions');
    expect(progress).toContain('workout-measurements');
    expect(progress).toContain('exercise-route');
    expect(progress.at(-1)).toBe('complete');
  });

  it('wraps Android availability and read failures with stage and stable error codes', async () => {
    const health = loadHealth();
    const { SdkAvailabilityStatus } = getHealthConnectModule();
    mockGetSdkStatus.mockResolvedValue(SdkAvailabilityStatus.SDK_UNAVAILABLE);
    await expect(health.RunichHealth.readWorkouts('start', 'end')).rejects.toMatchObject({
      name: 'HealthConnectReadError',
      stage: 'availability',
      errorCode: 'Error',
    });

    mockGetSdkStatus.mockResolvedValue(SdkAvailabilityStatus.SDK_AVAILABLE);
    mockReadRecords.mockRejectedValueOnce({ code: 'READ_FAILED' });
    await expect(health.RunichHealth.readWorkouts('start', 'end')).rejects.toMatchObject({
      name: 'HealthConnectReadError',
      stage: 'exercise-sessions',
      errorCode: 'READ_FAILED',
    });

    const nestedError = new health.HealthConnectReadError('workout-measurements', 'NESTED');
    mockReadRecords.mockRejectedValueOnce(nestedError);
    await expect(health.RunichHealth.readWorkouts('start', 'end')).rejects.toBe(nestedError);
  });

  it('uses the native iOS module and reports unsupported-platform fallbacks', async () => {
    const nativeModule = {
      getAvailability: jest.fn().mockResolvedValue('available'),
      getPermissions: jest.fn().mockResolvedValue({ available: true, granted: true }),
      requestPermissions: jest.fn().mockResolvedValue({ available: true, granted: true }),
      readWorkouts: jest.fn().mockResolvedValue([{ sourceActivityId: 'ios-workout' }]),
    };
    const health = loadHealth('ios', 17, nativeModule);
    const progress: string[] = [];

    await expect(health.RunichHealth.getAvailability()).resolves.toBe('available');
    await expect(health.RunichHealth.getPermissions()).resolves.toEqual({ available: true, granted: true });
    await expect(health.RunichHealth.requestPermissions()).resolves.toEqual({ available: true, granted: true });
    await expect(
      health.RunichHealth.readWorkouts('start', 'end', (item) => progress.push(item.stage)),
    ).resolves.toEqual([{ sourceActivityId: 'ios-workout' }]);
    expect(progress).toEqual(['availability', 'complete']);
    expect(nativeModule.readWorkouts).toHaveBeenCalledWith('start', 'end');

    const unsupported = loadHealth('ios', 17, null);
    await expect(unsupported.RunichHealth.getAvailability()).resolves.toBe('not-supported');
    await expect(unsupported.RunichHealth.getPermissions()).resolves.toEqual({ available: false, granted: false });
    await expect(unsupported.RunichHealth.requestPermissions()).rejects.toThrow('requestPermissions недоступен');
    await expect(unsupported.RunichHealth.readWorkouts('start', 'end')).rejects.toThrow('readWorkouts недоступен');
  });
});
