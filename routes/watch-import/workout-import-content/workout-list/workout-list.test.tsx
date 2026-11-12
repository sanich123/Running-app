import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { WORKOUT_IMPORT_COPY } from '../../workout-import/const';
import { formatImportSelectedLabel, getWorkoutId } from '../../workout-import/helpers';
import WorkoutList from './workout-list';
import type { WatchWorkout } from '../../../../modules/runich-health/src/RunichHealth';

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

describe('WorkoutList', () => {
  it('lets the user select, hide, and import a workout', async () => {
    const toggleWorkout = jest.fn();
    const hideWorkout = jest.fn(async () => undefined);
    const importSelected = jest.fn(async () => undefined);
    const workoutId = getWorkoutId(workout);
    const workoutWithSignals = {
      ...workout,
      heartRateSamples: [{ timestamp: 1_000, beatsPerMinute: 140 }],
      locations: [{ timestamp: 1_000, coords: { latitude: 55.75, longitude: 37.61 } }],
    };

    await renderWithProviders(
      <WorkoutList
        copy={WORKOUT_IMPORT_COPY.en}
        hiddenWorkouts={[]}
        hideWorkout={hideWorkout}
        importSelected={importSelected}
        isConnected
        isImporting={false}
        isIOS={false}
        isReading={false}
        isRussian={false}
        restoreWorkout={jest.fn(async () => undefined)}
        selectedIds={new Set([workoutId])}
        selectedWorkoutsCount={1}
        toggleWorkout={toggleWorkout}
        workouts={[workoutWithSignals]}
      />,
    );

    await fireEvent.press(screen.getByTestId(`health-connect-select-workout-${workoutId}`));
    await fireEvent.press(screen.getByTestId(`health-connect-hide-workout-${workoutId}`));
    await fireEvent.press(screen.getByTestId('health-connect-import-selected'));

    expect(toggleWorkout).toHaveBeenCalledWith(workoutWithSignals);
    expect(hideWorkout).toHaveBeenCalledWith(workoutWithSignals);
    expect(importSelected).toHaveBeenCalledTimes(1);
    expect(screen.getByText(formatImportSelectedLabel(1, false))).toBeOnTheScreen();
    expect(screen.getByLabelText(WORKOUT_IMPORT_COPY.en.workoutSignals.heartRateAvailable)).toBeOnTheScreen();
    expect(screen.getByLabelText(WORKOUT_IMPORT_COPY.en.workoutSignals.gpsAvailable)).toBeOnTheScreen();
  });

  it('expands hidden workouts and restores them to the import list', async () => {
    const restoreWorkout = jest.fn(async () => undefined);
    const workoutId = getWorkoutId(workout);

    await renderWithProviders(
      <WorkoutList
        copy={WORKOUT_IMPORT_COPY.en}
        hiddenWorkouts={[workout]}
        hideWorkout={jest.fn(async () => undefined)}
        importSelected={jest.fn(async () => undefined)}
        isConnected
        isImporting={false}
        isIOS={false}
        isReading={false}
        isRussian={false}
        restoreWorkout={restoreWorkout}
        selectedIds={new Set()}
        selectedWorkoutsCount={0}
        toggleWorkout={jest.fn()}
        workouts={[]}
      />,
    );

    await fireEvent.press(screen.getByTestId('health-connect-hidden-workouts-toggle'));
    await fireEvent.press(screen.getByTestId(`health-connect-restore-workout-${workoutId}`));

    expect(screen.getByText(workout.sport)).toBeOnTheScreen();
    expect(restoreWorkout).toHaveBeenCalledWith(workout);
  });

  it('shows platform-specific empty copy when no workouts are available', async () => {
    await renderWithProviders(
      <WorkoutList
        copy={WORKOUT_IMPORT_COPY.en}
        hiddenWorkouts={[]}
        hideWorkout={jest.fn(async () => undefined)}
        importSelected={jest.fn(async () => undefined)}
        isConnected
        isImporting={false}
        isIOS
        isReading={false}
        isRussian
        restoreWorkout={jest.fn(async () => undefined)}
        selectedIds={new Set()}
        selectedWorkoutsCount={0}
        toggleWorkout={jest.fn()}
        workouts={[]}
      />,
    );

    expect(screen.getByText(/No completed workouts/)).toBeOnTheScreen();
    expect(screen.queryByTestId('health-connect-import-selected')).toBeNull();
  });

  it('does not show data indicators when a workout has no heart-rate samples or GPS points', async () => {
    await renderWithProviders(
      <WorkoutList
        copy={WORKOUT_IMPORT_COPY.en}
        hiddenWorkouts={[]}
        hideWorkout={jest.fn(async () => undefined)}
        importSelected={jest.fn(async () => undefined)}
        isConnected
        isImporting={false}
        isIOS={false}
        isReading={false}
        isRussian={false}
        restoreWorkout={jest.fn(async () => undefined)}
        selectedIds={new Set()}
        selectedWorkoutsCount={0}
        toggleWorkout={jest.fn()}
        workouts={[workout]}
      />,
    );

    expect(screen.queryByLabelText(WORKOUT_IMPORT_COPY.en.workoutSignals.heartRateAvailable)).toBeNull();
    expect(screen.queryByLabelText(WORKOUT_IMPORT_COPY.en.workoutSignals.gpsAvailable)).toBeNull();
  });
});
