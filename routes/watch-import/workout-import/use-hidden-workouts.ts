import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import * as SecureStore from 'expo-secure-store';
import { errorToast } from '@S/error-toast/error-toast';
import { getWorkoutId, HIDDEN_WORKOUTS_KEY } from './helpers';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';

interface UseHiddenWorkoutsOptions {
  isRussian: boolean;
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
}

export function useHiddenWorkouts({ isRussian, setSelectedIds }: UseHiddenWorkoutsOptions) {
  const [hiddenWorkoutIds, setHiddenWorkoutIds] = useState<Set<string>>(new Set());
  const hiddenWorkoutIdsRef = useRef<Set<string>>(new Set());
  const hiddenWorkoutSaveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const restoreHiddenWorkoutIds = useCallback((savedValue: string | null) => {
    let parsedIds: Set<string>;
    try {
      const savedIds: unknown = savedValue ? JSON.parse(savedValue) : [];
      parsedIds = new Set(Array.isArray(savedIds) ? savedIds.filter((id): id is string => typeof id === 'string') : []);
    } catch {
      parsedIds = new Set();
    }
    hiddenWorkoutIdsRef.current = parsedIds;
    setHiddenWorkoutIds(parsedIds);
  }, []);

  const updateWorkoutHiddenState = useCallback(
    async (workout: WatchWorkout, hidden: boolean) => {
      const id = getWorkoutId(workout);
      const update = hiddenWorkoutSaveQueueRef.current.then(async () => {
        const nextIds = new Set(hiddenWorkoutIdsRef.current);
        if (hidden) nextIds.add(id);
        else nextIds.delete(id);

        await SecureStore.setItemAsync(HIDDEN_WORKOUTS_KEY, JSON.stringify([...nextIds]));
        hiddenWorkoutIdsRef.current = nextIds;
        setHiddenWorkoutIds(nextIds);
        setSelectedIds((current) => {
          const next = new Set(current);
          if (hidden) next.delete(id);
          else next.add(id);
          return next;
        });
      });
      hiddenWorkoutSaveQueueRef.current = update.catch(() => undefined);

      try {
        await update;
      } catch (saveError) {
        errorToast(
          isRussian ? 'Не удалось сохранить список скрытых тренировок.' : 'Could not save hidden workouts.',
          saveError,
        );
      }
    },
    [isRussian, setSelectedIds],
  );

  const hideWorkout = useCallback(
    (workout: WatchWorkout) => updateWorkoutHiddenState(workout, true),
    [updateWorkoutHiddenState],
  );
  const restoreWorkout = useCallback(
    (workout: WatchWorkout) => updateWorkoutHiddenState(workout, false),
    [updateWorkoutHiddenState],
  );

  return { hiddenWorkoutIds, hiddenWorkoutIdsRef, hideWorkout, restoreHiddenWorkoutIds, restoreWorkout };
}
