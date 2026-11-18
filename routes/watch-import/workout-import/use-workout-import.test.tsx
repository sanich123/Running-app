import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { resetAuthSlice } from '@R/slices/auth/auth';
import * as errorToastModule from '@S/error-toast/error-toast';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import {
  getAutoSyncKey,
  getConnectionKey,
  getHealthKitAuthorizationRequestKey,
  getWorkoutId,
  HIDDEN_WORKOUTS_KEY,
} from './helpers';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';
import type * as WorkoutImportModule from './use-workout-import';

const mockGetAvailability = jest.fn();
const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockReadWorkouts = jest.fn();
const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const originalPlatformOS = Platform.OS;

jest.mock('../../../modules/runich-health/src/RunichHealth', () => ({
  RunichHealth: {
    getAvailability: mockGetAvailability,
    getPermissions: mockGetPermissions,
    requestPermissions: mockRequestPermissions,
    readWorkouts: mockReadWorkouts,
  },
  HealthConnectReadError: class HealthConnectReadError extends Error {},
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: mockGetItemAsync,
  setItemAsync: mockSetItemAsync,
}));

const { useWorkoutImport } = require('./use-workout-import') as typeof WorkoutImportModule;

const workout: WatchWorkout = {
  source: 'health-connect',
  sourceActivityId: 'health-record-1',
  date: '2026-10-08T07:00:00.000Z',
  timeZone: 'Europe/Moscow',
  sport: 'run',
  duration: 600_000,
  distance: 2_000,
  locations: [],
  heartRateSamples: [
    { timestamp: 1_791_442_800_000, beatsPerMinute: 120 },
    { timestamp: 1_791_442_860_000, beatsPerMinute: 140 },
  ],
};

function Wrapper({ children }: PropsWithChildren) {
  return <Provider store={mockStore}>{children}</Provider>;
}

describe('useWorkoutImport', () => {
  let appStateListener: ((state: AppStateStatus) => void) | undefined;
  let importedWorkoutBatches: { url: string; body: unknown }[];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    importedWorkoutBatches = [];
    server.use(
      http.post(`${BASE_URL}/activity/:userId/watch-import/check`, async ({ request }) => {
        const { workouts } = (await request.json()) as {
          workouts: Pick<WatchWorkout, 'source' | 'sourceActivityId'>[];
        };
        return HttpResponse.json({ workoutsToSync: workouts });
      }),
      http.post(`${BASE_URL}/activity/:userId/watch-import`, async ({ request }) => {
        importedWorkoutBatches.push({ url: new URL(request.url).pathname, body: await request.json() });
        return HttpResponse.json({
          imported: 1,
          skipped: 0,
          activities: [{ id: 'activity-1', source: 'health-connect', sourceActivityId: 'health-record-1' }],
        });
      }),
    );
    mockGetAvailability.mockResolvedValue('available');
    mockGetPermissions.mockResolvedValue({
      available: true,
      granted: true,
      details: { exerciseSession: true, distance: true, steps: true, heartRate: true },
    });
    mockRequestPermissions.mockResolvedValue({
      available: true,
      granted: true,
      details: { exerciseSession: true, distance: true, steps: true, heartRate: true },
    });
    mockReadWorkouts.mockResolvedValue([workout]);
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);
    appStateListener = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _event: string,
      listener: (state: AppStateStatus) => void,
    ) => {
      appStateListener = listener;
      return { remove: jest.fn() };
    }) as typeof AppState.addEventListener);
    mockStore.dispatch(resetAuthSlice());
    mockStore.dispatch(setMockUserId('user-1'));
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
    await act(async () => {
      mockStore.dispatch(resetAuthSlice());
    });
  });

  it('reads workouts on the manual import page without uploading them', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.workouts).toHaveLength(1));

    expect(mockReadWorkouts).toHaveBeenCalledTimes(1);
    expect(importedWorkoutBatches).toHaveLength(0);
    expect(result.current.selectedWorkouts).toHaveLength(1);
  });

  it('does not enable automatic sync as a side effect of a manual import', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : key === getAutoSyncKey('user-1') ? 'false' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.selectedWorkouts).toHaveLength(1));
    expect(result.current.userId).toBe('user-1');
    expect(result.current.autoSyncEnabled).toBe(false);

    await act(async () => {
      await result.current.importSelected();
    });

    expect(importedWorkoutBatches).toEqual([
      {
        url: '/activity/user-1/watch-import',
        body: {
          workouts: [
            expect.objectContaining({
              sourceActivityId: workout.sourceActivityId,
              heartRateSamples: workout.heartRateSamples,
            }),
          ],
        },
      },
    ]);
    expect(result.current.uploadDiagnostics).toMatchObject({
      outcome: 'success',
      sourceHeartRateSampleCount: 2,
      payloadHeartRateSampleCount: 2,
      workouts: [
        expect.objectContaining({
          sourceHeartRateSampleCount: 2,
          payloadHeartRateSampleCount: 2,
          outcome: 'imported',
        }),
      ],
    });
    expect(mockSetItemAsync).not.toHaveBeenCalledWith(getAutoSyncKey('user-1'), 'true');
  });

  it('marks workout heart-rate samples as sent but not uploaded when the request fails', async () => {
    jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    server.use(http.post(`${BASE_URL}/activity/:userId/watch-import`, () => new HttpResponse(null, { status: 500 })));
    const { result } = await renderHook(() => useWorkoutImport({ enabled: false }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.refreshHealthConnection();
    });
    await waitFor(() => expect(result.current.selectedWorkouts).toEqual([workout]));

    await act(async () => {
      await result.current.importSelected();
    });

    expect(result.current.uploadDiagnostics).toMatchObject({
      outcome: 'error',
      errorStatus: '500',
      sourceHeartRateSampleCount: 2,
      payloadHeartRateSampleCount: 2,
      workouts: [
        expect.objectContaining({
          sourceHeartRateSampleCount: 2,
          payloadHeartRateSampleCount: 2,
          outcome: 'error',
        }),
      ],
    });
  });

  it('automatically uploads new workouts on startup and foreground return by default', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport({ autoSync: true }), { wrapper: Wrapper });

    await waitFor(() => expect(importedWorkoutBatches).toHaveLength(1));
    expect(result.current.isConnected).toBe(true);
    expect(result.current.autoSyncEnabled).toBe(true);

    await act(async () => {
      appStateListener?.('background');
      appStateListener?.('active');
    });

    await waitFor(() => expect(importedWorkoutBatches).toHaveLength(2));
  });

  it('does not initialize Health Connect when disabled', async () => {
    await renderHook(() => useWorkoutImport({ enabled: false }), { wrapper: Wrapper });

    expect(mockGetAvailability).not.toHaveBeenCalled();
    expect(mockGetPermissions).not.toHaveBeenCalled();
    expect(appStateListener).toBeUndefined();
  });

  it('requests permissions and persists the connection marker', async () => {
    const { result } = await renderHook(() => useWorkoutImport({ enabled: false }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.connect();
    });

    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(mockSetItemAsync).toHaveBeenCalledWith(getConnectionKey('user-1'), 'true');
    expect(mockSetItemAsync).toHaveBeenCalledWith(getAutoSyncKey('user-1'), 'true');
    expect(mockReadWorkouts).toHaveBeenCalledTimes(1);
    expect(importedWorkoutBatches).toHaveLength(1);
  });

  it('ignores the legacy connection marker on iOS until the user requests HealthKit access', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockGetPermissions.mockResolvedValue({ available: true });
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : null),
    );

    const { result } = await renderHook(() => useWorkoutImport(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(false);
    expect(mockReadWorkouts).not.toHaveBeenCalled();
    expect(mockRequestPermissions).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.connect();
    });

    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(mockSetItemAsync).toHaveBeenCalledWith(getHealthKitAuthorizationRequestKey('user-1'), 'true');
    expect(result.current.isConnected).toBe(true);
  });

  it('persists changes to the auto-sync switch', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : key === getAutoSyncKey('user-1') ? 'true' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.autoSyncEnabled).toBe(true));

    await act(async () => {
      await result.current.setAutoSyncEnabled(false);
    });

    expect(result.current.autoSyncEnabled).toBe(false);
    expect(mockSetItemAsync).toHaveBeenCalledWith(getAutoSyncKey('user-1'), 'false');
  });

  it('persists a hidden workout and restores it to the import selection', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.selectedWorkouts).toEqual([workout]));

    await act(async () => {
      await result.current.hideWorkout(workout);
    });

    expect(result.current.workouts).toEqual([]);
    expect(result.current.hiddenWorkouts).toEqual([workout]);
    expect(result.current.selectedWorkouts).toEqual([]);
    expect(mockSetItemAsync).toHaveBeenCalledWith(HIDDEN_WORKOUTS_KEY, JSON.stringify([getWorkoutId(workout)]));

    await act(async () => {
      await result.current.restoreWorkout(workout);
    });

    expect(result.current.workouts).toEqual([workout]);
    expect(result.current.hiddenWorkouts).toEqual([]);
    expect(result.current.selectedWorkouts).toEqual([workout]);
    expect(mockSetItemAsync).toHaveBeenLastCalledWith(HIDDEN_WORKOUTS_KEY, JSON.stringify([]));

    await act(async () => {
      result.current.toggleWorkout(workout);
      result.current.toggleWorkout(workout);
    });

    expect(result.current.selectedWorkouts).toEqual([workout]);
  });

  it('does not auto-import a saved hidden workout', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(
        key === getConnectionKey('user-1')
          ? 'true'
          : key === HIDDEN_WORKOUTS_KEY
            ? JSON.stringify([getWorkoutId(workout), null])
            : null,
      ),
    );
    const { result } = await renderHook(() => useWorkoutImport({ autoSync: true }), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.hiddenWorkouts).toEqual([workout]));

    expect(result.current.workouts).toEqual([]);
    expect(result.current.selectedWorkouts).toEqual([]);
    expect(result.current.uploadDiagnostics?.skipReason).toBe('no-workouts');
    expect(importedWorkoutBatches).toHaveLength(0);
  });

  it('continues reading workouts when the saved hidden list is malformed', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : key === HIDDEN_WORKOUTS_KEY ? '{broken' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.workouts).toEqual([workout]));

    expect(result.current.hiddenWorkouts).toEqual([]);
    expect(result.current.selectedWorkouts).toEqual([workout]);
  });

  it('marks an auto-sync read failure as skipped', async () => {
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    mockReadWorkouts.mockRejectedValue(new Error('Health Connect read failed'));
    const { result } = await renderHook(() => useWorkoutImport({ enabled: false }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.syncLatestWorkouts(true, true);
    });

    expect(result.current.uploadDiagnostics?.skipReason).toBe('read-failed');
    expect(result.current.workouts).toEqual([]);
    expect(errorToast).toHaveBeenCalled();
  });

  it('auto-syncs only workouts returned as sync candidates', async () => {
    const newWorkout: WatchWorkout = { ...workout, sourceActivityId: 'new-health-record' };
    mockReadWorkouts.mockResolvedValue([workout, newWorkout]);
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : null),
    );
    server.use(
      http.post(`${BASE_URL}/activity/:userId/watch-import/check`, () =>
        HttpResponse.json({
          workoutsToSync: [{ source: newWorkout.source, sourceActivityId: newWorkout.sourceActivityId }],
        }),
      ),
    );

    const { result } = await renderHook(() => useWorkoutImport({ autoSync: true }), { wrapper: Wrapper });

    await waitFor(() => expect(importedWorkoutBatches).toHaveLength(1));

    expect(importedWorkoutBatches[0]?.body).toEqual({
      workouts: [expect.objectContaining({ sourceActivityId: 'new-health-record' })],
    });
    expect(result.current.uploadDiagnostics).toMatchObject({ outcome: 'success', workoutCount: 1 });
  });

  it('uploads read workouts when the sync-candidate check is unavailable', async () => {
    mockReadWorkouts.mockResolvedValue([workout]);
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : null),
    );
    server.use(
      http.post(`${BASE_URL}/activity/:userId/watch-import/check`, () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = await renderHook(() => useWorkoutImport({ autoSync: true }), { wrapper: Wrapper });

    await waitFor(() => expect(importedWorkoutBatches).toHaveLength(1));

    expect(importedWorkoutBatches[0]?.body).toEqual({
      workouts: [expect.objectContaining({ sourceActivityId: workout.sourceActivityId })],
    });
    expect(result.current.uploadDiagnostics).toMatchObject({ outcome: 'success', workoutCount: 1 });
    expect(result.current.error).toBeNull();
  });
});
