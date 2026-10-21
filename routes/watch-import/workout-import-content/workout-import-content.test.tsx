import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { WORKOUT_IMPORT_COPY } from '../workout-import/const';
import { getWorkoutId } from '../workout-import/helpers';
import type * as WorkoutImportContentModule from './workout-import-content';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';

const mockUseWorkoutImport = jest.fn();

jest.mock('../workout-import/use-workout-import', () => ({
  useWorkoutImport: (...args: unknown[]) => mockUseWorkoutImport(...args),
}));

jest.mock('../workout-import/diagnostics-card/diagnostics-card', () => ({
  __esModule: true,
  default: () => null,
}));

const WorkoutImportContent = require('./workout-import-content').default as typeof WorkoutImportContentModule.default;

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

function createWorkoutImportState(overrides: Record<string, unknown> = {}) {
  return {
    availability: 'available',
    autoSyncEnabled: false,
    connect: jest.fn(),
    error: null,
    healthPermissions: [],
    healthStatusErrorCode: null,
    hiddenWorkouts: [],
    hideWorkout: jest.fn(),
    importResult: null,
    importSelected: jest.fn(),
    isAutoSyncing: false,
    isConnected: false,
    isImporting: false,
    isLoading: false,
    isReading: false,
    isRussian: false,
    needsHealthConnectApp: false,
    openHealthConnectInstallPage: jest.fn(),
    readDiagnostics: jest.fn(),
    refreshHealthConnection: jest.fn(),
    restoreWorkout: jest.fn(),
    selectedIds: new Set<string>(),
    selectedWorkouts: [],
    setAutoSyncEnabled: jest.fn(),
    syncLatestWorkouts: jest.fn(),
    toggleWorkout: jest.fn(),
    uploadDiagnostics: jest.fn(),
    userId: 'user-id',
    workouts: [],
    ...overrides,
  };
}

describe('WorkoutImportContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets the user open the provider page or retry after a provider update is required', async () => {
    const user = userEvent.setup();
    const state = createWorkoutImportState({ availability: 'provider-update-required' });
    mockUseWorkoutImport.mockReturnValue(state);

    await renderWithProviders(<WorkoutImportContent />);
    await user.press(screen.getByTestId('health-connect-open-provider'));
    await user.press(screen.getByTestId('health-connect-retry'));

    expect(state.openHealthConnectInstallPage).toHaveBeenCalledTimes(1);
    expect(state.refreshHealthConnection).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state until provider availability is known', async () => {
    mockUseWorkoutImport.mockReturnValue(createWorkoutImportState({ availability: null, isLoading: true }));

    await renderWithProviders(<WorkoutImportContent />);

    expect(screen.getByTestId('health-connect-loading')).toBeOnTheScreen();
  });

  it('opens the Health Connect page when the provider is missing', async () => {
    const user = userEvent.setup();
    const state = createWorkoutImportState({
      availability: 'provider-not-available',
      needsHealthConnectApp: true,
    });
    mockUseWorkoutImport.mockReturnValue(state);

    await renderWithProviders(<WorkoutImportContent />);
    await user.press(screen.getByTestId('health-connect-open-provider'));

    expect(state.openHealthConnectInstallPage).toHaveBeenCalledTimes(1);
  });

  it('explains when this Android version cannot use Health Connect', async () => {
    mockUseWorkoutImport.mockReturnValue(createWorkoutImportState({ availability: 'not-supported' }));

    await renderWithProviders(<WorkoutImportContent />);

    expect(screen.getByText(WORKOUT_IMPORT_COPY.en.minimumAndroid)).toBeOnTheScreen();
  });

  it('asks the user to connect Health Connect', async () => {
    const user = userEvent.setup();
    const state = createWorkoutImportState();
    mockUseWorkoutImport.mockReturnValue(state);

    await renderWithProviders(<WorkoutImportContent />);
    await user.press(screen.getByTestId('health-connect-connect'));

    expect(state.connect).toHaveBeenCalledTimes(1);
  });

  it('lets the user manage auto-sync and refresh an empty connected account', async () => {
    const user = userEvent.setup();
    const state = createWorkoutImportState({ isConnected: true });
    mockUseWorkoutImport.mockReturnValue(state);

    await renderWithProviders(<WorkoutImportContent />);
    await fireEvent(screen.getByTestId('health-connect-auto-sync-switch'), 'valueChange', true);
    await user.press(screen.getByTestId('health-connect-refresh'));

    expect(state.setAutoSyncEnabled).toHaveBeenCalledWith(true);
    expect(state.syncLatestWorkouts).toHaveBeenCalledWith(true);
    expect(screen.getByText(WORKOUT_IMPORT_COPY.en.noWorkouts)).toBeOnTheScreen();
  });

  it('keeps the loading state visible while workouts are being read', async () => {
    mockUseWorkoutImport.mockReturnValue(createWorkoutImportState({ isConnected: true, isReading: true }));

    await renderWithProviders(<WorkoutImportContent />);

    expect(screen.getByTestId('health-connect-loading')).toBeOnTheScreen();
    expect(screen.queryByText(WORKOUT_IMPORT_COPY.en.noWorkouts)).toBeNull();
  });

  it('lets the user select a workout or hide it from the import list', async () => {
    const user = userEvent.setup();
    const state = createWorkoutImportState({ isConnected: true, workouts: [workout] });
    const workoutId = getWorkoutId(workout);
    mockUseWorkoutImport.mockReturnValue(state);

    await renderWithProviders(<WorkoutImportContent />);
    await user.press(screen.getByTestId(`health-connect-select-workout-${workoutId}`));
    await user.press(screen.getByTestId(`health-connect-hide-workout-${workoutId}`));

    expect(state.toggleWorkout).toHaveBeenCalledWith(workout);
    expect(state.hideWorkout).toHaveBeenCalledWith(workout);
  });

  it('imports the workouts selected by the user', async () => {
    const user = userEvent.setup();
    const state = createWorkoutImportState({
      isConnected: true,
      selectedIds: new Set([getWorkoutId(workout)]),
      selectedWorkouts: [workout],
      workouts: [workout],
    });
    mockUseWorkoutImport.mockReturnValue(state);

    await renderWithProviders(<WorkoutImportContent />);
    await user.press(screen.getByTestId('health-connect-import-selected'));

    expect(state.importSelected).toHaveBeenCalledTimes(1);
  });

  it('expands hidden workouts and restores a selected workout to the import list', async () => {
    const user = userEvent.setup();
    const state = createWorkoutImportState({ isConnected: true, hiddenWorkouts: [workout] });
    const workoutId = getWorkoutId(workout);
    mockUseWorkoutImport.mockReturnValue(state);

    await renderWithProviders(<WorkoutImportContent />);
    await user.press(screen.getByTestId('health-connect-hidden-workouts-toggle'));
    await user.press(screen.getByTestId(`health-connect-restore-workout-${workoutId}`));

    expect(state.restoreWorkout).toHaveBeenCalledWith(workout);
  });

  it('shows import errors and the result of the most recent import', async () => {
    const error = 'Workout sync failed';
    const importResult = '1 workout imported';
    mockUseWorkoutImport.mockReturnValue(createWorkoutImportState({ error, importResult }));

    await renderWithProviders(<WorkoutImportContent />);

    expect(screen.getByText(error)).toBeOnTheScreen();
    expect(screen.getByText(importResult)).toBeOnTheScreen();
  });
});
