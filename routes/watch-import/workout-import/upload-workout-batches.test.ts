import { uploadWorkoutBatches } from './upload-workout-batches';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';
import type { UploadDiagnostics } from './types';

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

function createDiagnosticsSetter() {
  let diagnostics: UploadDiagnostics | null = null;
  const setDiagnostics: Parameters<typeof uploadWorkoutBatches>[3] = (next) => {
    diagnostics = typeof next === 'function' ? next(diagnostics) : next;
  };
  return { setDiagnostics, getDiagnostics: () => diagnostics };
}

describe('uploadWorkoutBatches cancellation', () => {
  it('does not start an upload when the operation was cancelled before its first batch', async () => {
    const controller = new AbortController();
    controller.abort();
    const importWorkouts = jest.fn() as unknown as Parameters<typeof uploadWorkoutBatches>[2];
    const { setDiagnostics, getDiagnostics } = createDiagnosticsSetter();

    await expect(
      uploadWorkoutBatches('user-1', [workout], importWorkouts, setDiagnostics, { signal: controller.signal }),
    ).rejects.toThrow('Workout import was cancelled');

    expect(importWorkouts).not.toHaveBeenCalled();
    expect(getDiagnostics()).toMatchObject({
      outcome: 'cancelled',
      workouts: [expect.objectContaining({ outcome: 'not-sent' })],
    });
  });

  it('aborts the active request when cancellation arrives before awaiting its response', async () => {
    const controller = new AbortController();
    const request = {
      abort: jest.fn(),
      unwrap: jest.fn().mockResolvedValue({ imported: 1, skipped: 0, activities: [] }),
    };
    const importWorkouts = jest.fn(() => {
      controller.abort();
      return request;
    }) as unknown as Parameters<typeof uploadWorkoutBatches>[2];
    const { setDiagnostics, getDiagnostics } = createDiagnosticsSetter();

    await expect(
      uploadWorkoutBatches('user-1', [workout], importWorkouts, setDiagnostics, { signal: controller.signal }),
    ).rejects.toThrow('Workout import was cancelled');

    expect(request.abort).toHaveBeenCalledTimes(1);
    expect(getDiagnostics()).toMatchObject({
      outcome: 'cancelled',
      workouts: [expect.objectContaining({ outcome: 'cancelled' })],
    });
  });
});
