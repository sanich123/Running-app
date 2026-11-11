import type { Dispatch, SetStateAction } from 'react';
import { mapWatchWorkoutToActivity } from '@U/watch-import/helpers';
import {
  getHeartRateSampleCount,
  getRequestErrorStatus,
  getRoutePointCount,
  getWatchWorkoutSourceKey,
  splitWatchWorkoutsIntoBatches,
} from './helpers';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';
import type { UploadDiagnostics, WorkoutUploadDiagnostic, WorkoutUploadOutcome } from './types';
import type { WatchWorkoutBatchImportResponse } from '@R/runich-api/activity-types';
import type { useImportWatchWorkoutsMutation } from '@R/services/activity/activity';

type ImportWatchWorkoutsMutation = ReturnType<typeof useImportWatchWorkoutsMutation>[0];

export async function uploadWorkoutBatches(
  userId: string,
  sourceWorkouts: WatchWorkout[],
  importWorkouts: ImportWatchWorkoutsMutation,
  setUploadDiagnostics: Dispatch<SetStateAction<UploadDiagnostics | null>>,
) {
  const mappedWorkouts = sourceWorkouts.map(mapWatchWorkoutToActivity);
  let workoutDiagnostics: WorkoutUploadDiagnostic[] = mappedWorkouts.map((workout, index) => ({
    source: sourceWorkouts[index].source,
    sourceActivityId: sourceWorkouts[index].sourceActivityId,
    sourceHeartRateSampleCount: sourceWorkouts[index].heartRateSamples?.length ?? 0,
    payloadHeartRateSampleCount: workout.heartRateSamples?.length ?? 0,
    outcome: 'not-sent',
  }));
  const updateWorkoutOutcomes = (sourceKeys: string[], outcome: WorkoutUploadOutcome) => {
    const updatedSourceKeys = new Set(sourceKeys);
    workoutDiagnostics = workoutDiagnostics.map((workout) =>
      updatedSourceKeys.has(getWatchWorkoutSourceKey(workout)) ? { ...workout, outcome } : workout,
    );
  };
  const diagnostics: UploadDiagnostics = {
    at: new Date().toISOString(),
    outcome: 'sending',
    workoutCount: mappedWorkouts.length,
    sourceRoutePointCount: getRoutePointCount(sourceWorkouts),
    payloadRoutePointCount: mappedWorkouts.reduce((total, workout) => total + workout.locations.length, 0),
    sourceHeartRateSampleCount: getHeartRateSampleCount(sourceWorkouts),
    payloadHeartRateSampleCount: getHeartRateSampleCount(mappedWorkouts),
    workouts: workoutDiagnostics,
  };
  setUploadDiagnostics(diagnostics);
  let imported = 0;
  let skipped = 0;
  const activities: WatchWorkoutBatchImportResponse['activities'] = [];
  let currentBatchSourceKeys: string[] = [];

  try {
    const batches = splitWatchWorkoutsIntoBatches(userId, mappedWorkouts);
    for (const workouts of batches) {
      currentBatchSourceKeys = workouts.map(getWatchWorkoutSourceKey);
      updateWorkoutOutcomes(currentBatchSourceKeys, 'sending');
      setUploadDiagnostics({ ...diagnostics, workouts: workoutDiagnostics });
      const batchResult = await importWorkouts({ id: userId, workouts }).unwrap();
      updateWorkoutOutcomes(currentBatchSourceKeys, 'uploaded');
      imported += batchResult.imported;
      skipped += batchResult.skipped;
      activities.push(...batchResult.activities);
      setUploadDiagnostics({ ...diagnostics, workouts: workoutDiagnostics, imported, skipped });
    }
    const result = { imported, skipped, activities };
    setUploadDiagnostics({
      ...diagnostics,
      outcome: 'success',
      workouts: workoutDiagnostics,
      imported,
      skipped,
    });
    return result;
  } catch (uploadError) {
    updateWorkoutOutcomes(currentBatchSourceKeys, 'error');
    setUploadDiagnostics({
      ...diagnostics,
      outcome: 'error',
      workouts: workoutDiagnostics,
      imported,
      skipped,
      errorStatus: getRequestErrorStatus(uploadError),
    });
    throw uploadError;
  }
}
