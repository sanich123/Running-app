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
  getConnectionKey,
  getDiagnosticErrorCode,
  getRequestErrorStatus,
  getWorkoutId,
  getRoutePointCount,
} from './helpers';
import type { ReadDiagnostics, UploadDiagnostics, UploadSkipReason } from './types';

export function useWorkoutImport() {
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const isRussian = language === LANGUAGES.russian;
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);
  const [healthPermissions, setHealthPermissions] = useState<HealthPermissionsResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [workouts, setWorkouts] = useState<WatchWorkout[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
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

  const markUploadSkipped = useCallback((reason: UploadSkipReason, sourceWorkouts: WatchWorkout[] = []) => {
    setUploadDiagnostics({
      at: new Date().toISOString(),
      outcome: 'skipped',
      skipReason: reason,
      workoutCount: sourceWorkouts.length,
      sourceRoutePointCount: getRoutePointCount(sourceWorkouts),
      payloadRoutePointCount: 0,
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
      setSelectedIds(new Set(result.map(getWorkoutId)));
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
      return result;
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

  const sendWorkoutsToRunich = useCallback(
    async (id: string, sourceWorkouts: WatchWorkout[]) => {
      const mappedWorkouts = sourceWorkouts.map(mapWatchWorkoutToActivity);
      const diagnostics: UploadDiagnostics = {
        at: new Date().toISOString(),
        outcome: 'sending',
        workoutCount: mappedWorkouts.length,
        sourceRoutePointCount: getRoutePointCount(sourceWorkouts),
        payloadRoutePointCount: mappedWorkouts.reduce((total, workout) => total + workout.locations.length, 0),
      };
      setUploadDiagnostics(diagnostics);

      try {
        const result = await importWorkouts({ id, workouts: mappedWorkouts }).unwrap();
        setUploadDiagnostics({
          ...diagnostics,
          outcome: 'success',
          imported: result.imported,
          skipped: result.skipped,
        });
        return result;
      } catch (uploadError) {
        setUploadDiagnostics({
          ...diagnostics,
          outcome: 'error',
          errorStatus: getRequestErrorStatus(uploadError),
        });
        throw uploadError;
      }
    },
    [importWorkouts],
  );

  const syncLatestWorkouts = useCallback(
    async (autoImport: boolean) => {
      const result = await readWorkouts();
      if (result === null) {
        markUploadSkipped('read-failed');
        return;
      }
      if (!autoImport) {
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
      const savedConnection = connectionKey ? SecureStore.getItemAsync(connectionKey) : Promise.resolve(null);

      try {
        const [nextAvailability, permissions, savedConnectionValue] = await Promise.all([
          RunichHealth.getAvailability(),
          RunichHealth.getPermissions(),
          savedConnection,
        ]);
        if (!isActive()) return;

        setAvailability(nextAvailability);
        setHealthPermissions(permissions);
        const connected = permissions.available && (permissions.granted || savedConnectionValue === 'true');
        setIsConnected(connected);
        if (connected) void syncLatestWorkouts(true);
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
    [isRussian, syncLatestWorkouts, userId],
  );

  useEffect(() => {
    let isMounted = true;
    void refreshHealthConnection(() => isMounted);
    return () => {
      isMounted = false;
    };
  }, [refreshHealthConnection]);

  const previousAppState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const returnedToApp = previousAppState.current !== 'active' && nextAppState === 'active' && Boolean(userId);
      previousAppState.current = nextAppState;
      if (returnedToApp) {
        if (availability === 'available' && isConnected) void syncLatestWorkouts(true);
        else void refreshHealthConnection();
      }
    });
    return () => subscription.remove();
  }, [availability, isConnected, refreshHealthConnection, syncLatestWorkouts, userId]);

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
      const workoutsAfterConnect = await readWorkouts();
      if (workoutsAfterConnect === null) markUploadSkipped('read-failed');
      else if (!userId) markUploadSkipped('no-user', workoutsAfterConnect);
      else if (workoutsAfterConnect.length === 0) markUploadSkipped('no-workouts');
      else markUploadSkipped('manual-selection', workoutsAfterConnect);
    } catch (connectError) {
      setHealthStatusErrorCode(getDiagnosticErrorCode(connectError));
      setError(isRussian ? 'Не удалось подключить хранилище здоровья.' : 'Could not connect the health store.');
      errorToast('', connectError);
    } finally {
      setIsLoading(false);
    }
  }, [isRussian, markUploadSkipped, readWorkouts, userId]);

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
    connect,
    error,
    healthPermissions,
    healthStatusErrorCode,
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
    syncLatestWorkouts,
    toggleWorkout,
    uploadDiagnostics,
    userId,
    workouts,
  };
}
