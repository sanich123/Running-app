import { useCallback, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { useImportWatchWorkoutsMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getWatchImportDateRange } from '@U/watch-import/helpers';
import {
  HealthConnectReadError,
  RunichHealth,
  type HealthConnectReadProgress,
  type WatchWorkout,
} from '../../../modules/runich-health/src/RunichHealth';
import { HEALTH_CONNECT_PLAY_STORE_URL } from '../const';
import { getDiagnosticErrorCode, getHeartRateSampleCount, getWorkoutId, getRoutePointCount } from './helpers';
import { uploadWorkoutBatches } from './upload-workout-batches';
import { useAutoSyncPreference } from './use-auto-sync-preference';
import { useHiddenWorkouts } from './use-hidden-workouts';
import { useWorkoutImportConnection } from './use-workout-import-connection';
import type { ReadDiagnostics, UploadDiagnostics, UploadSkipReason } from './types';

interface UseWorkoutImportOptions {
  autoSync?: boolean;
  enabled?: boolean;
}

export function useWorkoutImport({ autoSync = false, enabled = true }: UseWorkoutImportOptions = {}) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const isRussian = language === LANGUAGES.russian;
  const { autoSyncEnabled, autoSyncEnabledRef, restoreAutoSyncEnabled, setAutoSyncEnabled } = useAutoSyncPreference({
    isRussian,
    userId,
  });
  const [workouts, setWorkouts] = useState<WatchWorkout[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { hiddenWorkoutIds, hiddenWorkoutIdsRef, hideWorkout, restoreWorkout, restoreHiddenWorkoutIds } =
    useHiddenWorkouts({ isRussian, setSelectedIds });
  const [isReading, setIsReading] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
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
      setError(
        Platform.OS === 'ios'
          ? isRussian
            ? 'Не удалось прочитать тренировки. Проверьте доступ Runich к тренировкам в Apple Health.'
            : 'Could not read workouts. Check Runich workout access in Apple Health.'
          : isRussian
            ? 'Не удалось получить тренировки из хранилища здоровья.'
            : 'Could not read workouts.',
      );
      errorToast('', readError);
      return null;
    } finally {
      setIsReading(false);
    }
  }, [hiddenWorkoutIdsRef, isRussian]);

  const sendWorkoutsToRunich = useCallback(
    (id: string, sourceWorkouts: WatchWorkout[]) =>
      uploadWorkoutBatches(id, sourceWorkouts, importWorkouts, setUploadDiagnostics),
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
    [autoSyncEnabledRef, isRussian, markUploadSkipped, readWorkouts, sendWorkoutsToRunich, userId],
  );

  const { availability, connect, healthPermissions, isConnected, isLoading, refreshHealthConnection } =
    useWorkoutImportConnection({
      autoSync,
      autoSyncEnabled,
      enabled,
      isRussian,
      userId,
      readWorkouts,
      restoreAutoSyncEnabled,
      restoreHiddenWorkoutIds,
      setAutoSyncEnabled,
      setError,
      setHealthStatusErrorCode,
      setImportResult,
      syncLatestWorkouts,
    });

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
