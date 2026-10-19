import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppState, Linking, Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { useImportWatchWorkoutsMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getWatchImportDateRange, mapWatchWorkoutToActivity } from '@U/watch-import/helpers';
import {
  HealthConnectReadError,
  RunichHealth,
  type HealthAvailability,
  type HealthConnectReadProgress,
  type HealthPermissionsResult,
  type WatchWorkout,
} from '../../../modules/runich-health/src/RunichHealth';
import { HEALTH_CONNECT_PLAY_STORE_URL } from '../const';
import {
  getAutoSyncKey,
  getConnectionKey,
  getDiagnosticErrorCode,
  getHeartRateSampleCount,
  getRequestErrorStatus,
  getWatchWorkoutSourceKey,
  getWorkoutId,
  getRoutePointCount,
  HIDDEN_WORKOUTS_KEY,
  splitWatchWorkoutsIntoBatches,
} from './helpers';
import type {
  ReadDiagnostics,
  UploadDiagnostics,
  UploadSkipReason,
  WorkoutUploadDiagnostic,
  WorkoutUploadOutcome,
} from './types';
import type { WatchWorkoutBatchImportResponse } from '@R/runich-api/types';

interface UseWorkoutImportOptions {
  autoSync?: boolean;
  enabled?: boolean;
}

export function useWorkoutImport({ autoSync = false, enabled = true }: UseWorkoutImportOptions = {}) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const isRussian = language === LANGUAGES.russian;
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);
  const [healthPermissions, setHealthPermissions] = useState<HealthPermissionsResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [workouts, setWorkouts] = useState<WatchWorkout[]>([]);
  const [hiddenWorkoutIds, setHiddenWorkoutIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState(false);
  const autoSyncEnabledRef = useRef(false);
  const hiddenWorkoutIdsRef = useRef<Set<string>>(new Set());
  const hiddenWorkoutSaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [healthStatusErrorCode, setHealthStatusErrorCode] = useState<string | null>(null);
  const [readDiagnostics, setReadDiagnostics] = useState<ReadDiagnostics | null>(null);
  const [uploadDiagnostics, setUploadDiagnostics] = useState<UploadDiagnostics | null>(null);
  const [importWorkouts, { isLoading: isImporting }] = useImportWatchWorkoutsMutation();
  const selectedWorkouts = useMemo(
    () => workouts.filter((workout) => selectedIds.has(getWorkoutId(workout))),
    [selectedIds, workouts],
  );
  const visibleWorkouts = useMemo(
    () => workouts.filter((workout) => !hiddenWorkoutIds.has(getWorkoutId(workout))),
    [hiddenWorkoutIds, workouts],
  );
  const hiddenWorkouts = useMemo(
    () => workouts.filter((workout) => hiddenWorkoutIds.has(getWorkoutId(workout))),
    [hiddenWorkoutIds, workouts],
  );

  const setAutoSyncEnabled = useCallback(
    async (enabled: boolean) => {
      autoSyncEnabledRef.current = enabled;
      setAutoSyncEnabledState(enabled);

      const autoSyncKey = getAutoSyncKey(userId);
      if (!autoSyncKey) return;

      try {
        await SecureStore.setItemAsync(autoSyncKey, String(enabled));
      } catch (saveError) {
        errorToast(
          isRussian ? 'Не удалось сохранить настройку автосинхронизации.' : 'Could not save auto-sync setting.',
          saveError,
        );
      }
    },
    [isRussian, userId],
  );

  const markUploadSkipped = useCallback((reason: UploadSkipReason, sourceWorkouts: WatchWorkout[] = []) => {
    setUploadDiagnostics({
      at: new Date().toISOString(),
      outcome: 'skipped',
      skipReason: reason,
      workoutCount: sourceWorkouts.length,
      sourceRoutePointCount: getRoutePointCount(sourceWorkouts),
      payloadRoutePointCount: 0,
      sourceHeartRateSampleCount: getHeartRateSampleCount(sourceWorkouts),
      payloadHeartRateSampleCount: 0,
      workouts: sourceWorkouts.map((workout) => ({
        source: workout.source,
        sourceActivityId: workout.sourceActivityId,
        sourceHeartRateSampleCount: workout.heartRateSamples?.length ?? 0,
        payloadHeartRateSampleCount: 0,
        outcome: 'not-sent',
      })),
    });
  }, []);

  const readWorkouts = useCallback(async (): Promise<WatchWorkout[] | null> => {
    setIsReading(true);
    setError(null);
    const { startDate, endDate } = getWatchImportDateRange();
    const readAt = new Date().toISOString();
    setReadDiagnostics({ at: readAt, startDate, endDate, outcome: 'reading', workoutCount: 0, stage: 'availability' });
    try {
      const result = await RunichHealth.readWorkouts(startDate, endDate, (progress: HealthConnectReadProgress) => {
        setReadDiagnostics((current) =>
          current?.at === readAt
            ? {
                ...current,
                outcome: 'reading',
                stage: progress.stage,
                sessionCount: progress.sessionCount ?? current.sessionCount,
                processedSessionCount: progress.processedSessionCount ?? current.processedSessionCount,
                workoutCount: progress.processedSessionCount ?? current.workoutCount,
              }
            : current,
        );
      });
      setWorkouts(result);
      const availableWorkouts = result.filter((workout) => !hiddenWorkoutIdsRef.current.has(getWorkoutId(workout)));
      setSelectedIds(new Set(availableWorkouts.map(getWorkoutId)));
      setReadDiagnostics({
        at: readAt,
        startDate,
        endDate,
        outcome: 'success',
        workoutCount: result.length,
        stage: 'complete',
        sessionCount: result.length,
        processedSessionCount: result.length,
      });
      return availableWorkouts;
    } catch (readError) {
      setWorkouts([]);
      setSelectedIds(new Set());
      setReadDiagnostics({
        at: readAt,
        startDate,
        endDate,
        outcome: 'error',
        workoutCount: 0,
        ...(readError instanceof HealthConnectReadError
          ? { stage: readError.stage, errorCode: readError.errorCode }
          : { errorCode: getDiagnosticErrorCode(readError) }),
      });
      setError(isRussian ? 'Не удалось получить тренировки из хранилища здоровья.' : 'Could not read workouts.');
      errorToast('', readError);
      return null;
    } finally {
      setIsReading(false);
    }
  }, [isRussian]);

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
        if (hidden) {
          setSelectedIds((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
        } else {
          setSelectedIds((current) => new Set(current).add(id));
        }
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
    [isRussian],
  );

  const hideWorkout = useCallback(
    (workout: WatchWorkout) => updateWorkoutHiddenState(workout, true),
    [updateWorkoutHiddenState],
  );

  const restoreWorkout = useCallback(
    (workout: WatchWorkout) => updateWorkoutHiddenState(workout, false),
    [updateWorkoutHiddenState],
  );

  const sendWorkoutsToRunich = useCallback(
    async (id: string, sourceWorkouts: WatchWorkout[]) => {
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
        const batches = splitWatchWorkoutsIntoBatches(id, mappedWorkouts);
        for (const workouts of batches) {
          currentBatchSourceKeys = workouts.map(getWatchWorkoutSourceKey);
          updateWorkoutOutcomes(currentBatchSourceKeys, 'sending');
          setUploadDiagnostics({ ...diagnostics, workouts: workoutDiagnostics });
          const batchResult = await importWorkouts({ id, workouts }).unwrap();
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
    },
    [importWorkouts],
  );

  const syncLatestWorkouts = useCallback(
    async (autoImport: boolean, autoImportAllowed = autoSyncEnabledRef.current) => {
      const result = await readWorkouts();
      if (result === null) {
        markUploadSkipped('read-failed');
        return;
      }
      if (!autoImport || !autoImportAllowed) {
        markUploadSkipped('manual-selection', result);
        return;
      }
      if (!userId) {
        markUploadSkipped('no-user', result);
        return;
      }
      if (result.length === 0) {
        markUploadSkipped('no-workouts');
        return;
      }

      setIsAutoSyncing(true);
      try {
        const resultOfImport = await sendWorkoutsToRunich(userId, result);
        setImportResult(
          isRussian
            ? `Автосинхронизация: новых тренировок ${resultOfImport.imported}, уже были в Runich: ${resultOfImport.skipped}.`
            : `Auto-sync: ${resultOfImport.imported} new workouts, ${resultOfImport.skipped} already in Runich.`,
        );
        setSelectedIds(new Set());
      } catch (importError) {
        setError(
          isRussian ? 'Не удалось автоматически сохранить тренировки в Runich.' : 'Auto-sync could not save workouts.',
        );
        errorToast('', importError);
      } finally {
        setIsAutoSyncing(false);
      }
    },
    [isRussian, markUploadSkipped, readWorkouts, sendWorkoutsToRunich, userId],
  );

  const refreshHealthConnection = useCallback(
    async (isActive: () => boolean = () => true) => {
      setIsLoading(true);
      setError(null);
      setHealthStatusErrorCode(null);
      const connectionKey = getConnectionKey(userId);
      const autoSyncKey = getAutoSyncKey(userId);
      const savedHiddenWorkouts = SecureStore.getItemAsync(HIDDEN_WORKOUTS_KEY);
      const savedConnection = connectionKey ? SecureStore.getItemAsync(connectionKey) : Promise.resolve(null);
      const savedAutoSync = autoSyncKey ? SecureStore.getItemAsync(autoSyncKey) : Promise.resolve(null);

      try {
        const [nextAvailability, permissions, savedConnectionValue, savedAutoSyncValue, savedHiddenWorkoutsValue] =
          await Promise.all([
            RunichHealth.getAvailability(),
            RunichHealth.getPermissions(),
            savedConnection,
            savedAutoSync,
            savedHiddenWorkouts,
          ]);
        if (!isActive()) return;

        let parsedHiddenWorkoutIds: Set<string>;
        try {
          const savedIds: unknown = savedHiddenWorkoutsValue ? JSON.parse(savedHiddenWorkoutsValue) : [];
          parsedHiddenWorkoutIds = new Set(
            Array.isArray(savedIds) ? savedIds.filter((id): id is string => typeof id === 'string') : [],
          );
        } catch {
          parsedHiddenWorkoutIds = new Set();
        }
        hiddenWorkoutIdsRef.current = parsedHiddenWorkoutIds;
        setHiddenWorkoutIds(parsedHiddenWorkoutIds);

        setAvailability(nextAvailability);
        setHealthPermissions(permissions);
        const savedAutoSyncEnabled = savedAutoSyncValue !== 'false';
        autoSyncEnabledRef.current = savedAutoSyncEnabled;
        setAutoSyncEnabledState(savedAutoSyncEnabled);
        const connected = permissions.available && (permissions.granted || savedConnectionValue === 'true');
        setIsConnected(connected);
        if (connected && autoSync && userId && savedAutoSyncEnabled) {
          void syncLatestWorkouts(true, true);
        } else if (connected && !autoSync) {
          void readWorkouts();
        }
      } catch (loadError) {
        if (isActive()) {
          setHealthStatusErrorCode(getDiagnosticErrorCode(loadError));
          setError(
            isRussian
              ? 'Не удалось проверить подключение хранилища здоровья.'
              : 'Could not check the health store connection.',
          );
          errorToast('', loadError);
        }
      } finally {
        if (isActive()) setIsLoading(false);
      }
    },
    [autoSync, isRussian, readWorkouts, syncLatestWorkouts, userId],
  );

  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;
    const refreshTimeout = setTimeout(() => {
      void refreshHealthConnection(() => isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(refreshTimeout);
    };
  }, [enabled, refreshHealthConnection]);

  const previousAppState = useRef(AppState.currentState);
  useEffect(() => {
    if (!enabled) return;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const returnedToApp = previousAppState.current !== 'active' && nextAppState === 'active' && Boolean(userId);
      previousAppState.current = nextAppState;
      if (returnedToApp) {
        if (availability === 'available' && isConnected) {
          if (autoSync && autoSyncEnabled) void syncLatestWorkouts(true);
          else if (!autoSync) void readWorkouts();
        } else void refreshHealthConnection();
      }
    });
    return () => subscription.remove();
  }, [
    autoSync,
    autoSyncEnabled,
    availability,
    enabled,
    isConnected,
    readWorkouts,
    refreshHealthConnection,
    syncLatestWorkouts,
    userId,
  ]);

  const connect = useCallback(async () => {
    setError(null);
    setHealthStatusErrorCode(null);
    setImportResult(null);
    setIsLoading(true);
    try {
      const permissions = await RunichHealth.requestPermissions();
      setHealthPermissions(permissions);
      setIsConnected(permissions.granted);
      if (!permissions.granted) {
        setError(isRussian ? 'Доступ к тренировкам не предоставлен.' : 'Workout access was not granted.');
        return;
      }
      const connectionKey = getConnectionKey(userId);
      if (connectionKey) {
        try {
          await SecureStore.setItemAsync(connectionKey, 'true');
        } catch {
          // The health connection itself does not depend on local marker storage.
        }
      }
      await setAutoSyncEnabled(true);
      await syncLatestWorkouts(true, true);
    } catch (connectError) {
      setHealthStatusErrorCode(getDiagnosticErrorCode(connectError));
      setError(isRussian ? 'Не удалось подключить хранилище здоровья.' : 'Could not connect the health store.');
      errorToast('', connectError);
    } finally {
      setIsLoading(false);
    }
  }, [isRussian, setAutoSyncEnabled, syncLatestWorkouts, userId]);

  const openExternalLink = useCallback(
    async (url: string, errorMessage = isRussian ? 'Не удалось открыть ссылку.' : 'Could not open the link.') => {
      try {
        await Linking.openURL(url);
      } catch (openError) {
        setError(errorMessage);
        errorToast('', openError);
      }
    },
    [isRussian],
  );

  const openHealthConnectInstallPage = useCallback(
    () =>
      openExternalLink(
        HEALTH_CONNECT_PLAY_STORE_URL,
        isRussian ? 'Не удалось открыть страницу Health Connect.' : 'Could not open the Health Connect page.',
      ),
    [isRussian, openExternalLink],
  );

  const importSelected = useCallback(async () => {
    if (!userId || selectedWorkouts.length === 0) return;
    setError(null);
    setImportResult(null);
    try {
      const result = await sendWorkoutsToRunich(userId, selectedWorkouts);
      setImportResult(
        isRussian
          ? `Импортировано: ${result.imported}. Пропущено как уже загруженные: ${result.skipped}.`
          : `Imported: ${result.imported}. Already imported: ${result.skipped}.`,
      );
      setSelectedIds(new Set());
    } catch (importError) {
      setError(isRussian ? 'Не удалось сохранить тренировки в Runich.' : 'Could not save workouts to Runich.');
      errorToast('', importError);
    }
  }, [isRussian, selectedWorkouts, sendWorkoutsToRunich, userId]);

  const toggleWorkout = useCallback((workout: WatchWorkout) => {
    const id = getWorkoutId(workout);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return {
    availability,
    autoSyncEnabled,
    connect,
    error,
    healthPermissions,
    healthStatusErrorCode,
    hiddenWorkouts,
    hideWorkout,
    importResult,
    importSelected,
    isAutoSyncing,
    isConnected,
    isImporting,
    isLoading,
    isReading,
    isRussian,
    needsHealthConnectApp: Platform.OS === 'android' && Number(Platform.Version) < 34,
    openExternalLink,
    openHealthConnectInstallPage,
    readDiagnostics,
    refreshHealthConnection,
    selectedIds,
    selectedWorkouts,
    restoreWorkout,
    setAutoSyncEnabled,
    syncLatestWorkouts,
    toggleWorkout,
    uploadDiagnostics,
    userId,
    workouts: visibleWorkouts,
  };
}
