import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { getAutoSyncKey, getConnectionKey } from './helpers';
import type * as WorkoutImportModule from './use-workout-import';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';

const mockGetAvailability = jest.fn();
const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockReadWorkouts = jest.fn();
const mockImportWorkouts = jest.fn();
const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();

jest.mock('../../../modules/runich-health/src/RunichHealth', () => ({
  RunichHealth: {
    getAvailability: mockGetAvailability,
    getPermissions: mockGetPermissions,
    requestPermissions: mockRequestPermissions,
    readWorkouts: mockReadWorkouts,
  },
  HealthConnectReadError: class HealthConnectReadError extends Error {},
}));
jest.mock('@R/services/activity/activity', () => ({
  useImportWatchWorkoutsMutation: () => [mockImportWorkouts, { isLoading: false }],
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
};

function Wrapper({ children }: PropsWithChildren) {
  return <Provider store={mockStore}>{children}</Provider>;
}

describe('useWorkoutImport', () => {
  let appStateListener: ((state: AppStateStatus) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailability.mockResolvedValue('available');
    mockGetPermissions.mockResolvedValue({
      available: true,
      granted: true,
      details: { exerciseSession: true, distance: true, steps: true },
    });
    mockRequestPermissions.mockResolvedValue({
      available: true,
      granted: true,
      details: { exerciseSession: true, distance: true, steps: true },
    });
    mockReadWorkouts.mockResolvedValue([workout]);
    mockImportWorkouts.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ imported: 1, skipped: 0 }),
    });
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
    expect(mockImportWorkouts).not.toHaveBeenCalled();
    expect(result.current.selectedWorkouts).toHaveLength(1);
  });

  it('enables automatic sync only after the first successful manual import', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') ? 'true' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.selectedWorkouts).toHaveLength(1));
    expect(result.current.userId).toBe('user-1');

    await act(async () => {
      await result.current.importSelected();
    });

    expect(mockImportWorkouts).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        workouts: [expect.objectContaining({ sourceActivityId: workout.sourceActivityId })],
      }),
    );
    expect(mockSetItemAsync).toHaveBeenCalledWith(getAutoSyncKey('user-1'), 'true');
  });

  it('automatically uploads new workouts on startup and foreground return after opt-in', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === getConnectionKey('user-1') || key === getAutoSyncKey('user-1') ? 'true' : null),
    );
    const { result } = await renderHook(() => useWorkoutImport({ autoSync: true }), { wrapper: Wrapper });

    await waitFor(() => expect(mockImportWorkouts).toHaveBeenCalledTimes(1));
    expect(result.current.isConnected).toBe(true);

    await act(async () => {
      appStateListener?.('background');
      appStateListener?.('active');
    });

    await waitFor(() => expect(mockImportWorkouts).toHaveBeenCalledTimes(2));
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
    expect(mockReadWorkouts).toHaveBeenCalledTimes(1);
  });
});
