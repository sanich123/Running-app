import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppState, Linking, Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Button, Card, Checkbox, Divider, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useImportWatchWorkoutsMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { errorToast } from '@S/error-toast/error-toast';
import { getWatchImportDateRange, mapWatchWorkoutToActivity } from '@U/watch-import/watch-import';
import {
  HealthConnectReadError,
  RunichHealth,
  type HealthAvailability,
  type HealthConnectReadProgress,
  type HealthConnectReadStage,
  type HealthPermissionsResult,
  type WatchWorkout,
  type WatchWorkoutRouteStatus,
} from '../../modules/runich-health/src/RunichHealth';

interface ReadDiagnostics {
  at: string;
  startDate: string;
  endDate: string;
  outcome: 'reading' | 'success' | 'error';
  workoutCount: number;
  stage?: HealthConnectReadStage;
  sessionCount?: number;
  processedSessionCount?: number;
  errorCode?: string;
}

type UploadSkipReason = 'read-failed' | 'no-user' | 'no-workouts' | 'manual-selection';

interface UploadDiagnostics {
  at: string;
  outcome: 'sending' | 'success' | 'error' | 'skipped';
  workoutCount: number;
  sourceRoutePointCount: number;
  payloadRoutePointCount: number;
  skipReason?: UploadSkipReason;
  imported?: number;
  skipped?: number;
  errorStatus?: string;
}

function getDiagnosticErrorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return 'UnknownError';
  if ('code' in error && typeof error.code === 'string') return error.code;
  if ('name' in error && typeof error.name === 'string') return error.name;
  return 'UnknownError';
}

function getRequestErrorStatus(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = error.status;
    if (typeof status === 'number' || typeof status === 'string') return String(status);
  }
  return getDiagnosticErrorCode(error);
}

function getRouteStatusLabel(status: WatchWorkoutRouteStatus | undefined, isRussian: boolean): string {
  const labels: Record<WatchWorkoutRouteStatus, [string, string]> = {
    'route-in-record': ['маршрут в записи', 'route in record'],
    'no-route-data': ['Health Connect сообщает: маршрута нет', 'Health Connect reports no route'],
    'route-not-provided': ['маршрут не предоставлен', 'route not provided'],
    'consent-granted': ['доступ выдан, точки получены', 'consent granted, points read'],
    'consent-granted-empty': ['доступ выдан, точек нет', 'consent granted, no points'],
    'consent-denied-or-error': ['отказ или ошибка доступа', 'consent denied or read failed'],
  };
  if (!status) return isRussian ? 'статус маршрута недоступен' : 'route status unavailable';
  return labels[status][isRussian ? 0 : 1];
}

function getBooleanLabel(value: boolean | undefined, isRussian: boolean): string {
  if (value === undefined) return isRussian ? 'неизвестно' : 'unknown';
  return value ? (isRussian ? 'да' : 'yes') : isRussian ? 'нет' : 'no';
}

function getReadStageLabel(stage: HealthConnectReadStage, isRussian: boolean): string {
  const labels: Record<HealthConnectReadStage, [string, string]> = {
    availability: ['проверка Health Connect', 'checking Health Connect'],
    'exercise-sessions': ['чтение списка активностей', 'reading exercise sessions'],
    'distance-and-steps': ['чтение расстояния и шагов', 'reading distance and steps'],
    'exercise-route': ['запрос доступа к маршруту', 'requesting route access'],
    complete: ['чтение завершено', 'read complete'],
  };
  return labels[stage][isRussian ? 0 : 1];
}

function getUploadSkipReasonLabel(reason: UploadSkipReason, isRussian: boolean): string {
  const labels: Record<UploadSkipReason, [string, string]> = {
    'read-failed': ['чтение завершилось ошибкой', 'the health store read failed'],
    'no-user': ['аккаунт Runich не определён', 'Runich account is unavailable'],
    'no-workouts': ['не найдено тренировок для отправки', 'no workouts were found to upload'],
    'manual-selection': [
      'ожидается выбор тренировок для первого импорта',
      'waiting for workout selection on first import',
    ],
  };
  return labels[reason][isRussian ? 0 : 1];
}

function getWorkoutId(workout: WatchWorkout) {
  return `${workout.source}:${workout.sourceActivityId}`;
}

function getConnectionKey(userId: string | null) {
  return userId ? `runich.watch.connected.${userId}` : null;
}

const HEALTH_CONNECT_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
const HEALTH_SYNC_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=nl.appyhapps.healthsync';
const HEALTH_SYNC_APP_STORE_URL = 'https://apps.apple.com/us/app/health-sync-by-appyhapps/id6480174471';
const HEALTH_SYNC_GUIDE_URL = 'https://healthsync.app/about/';
const SUUNTO_APP_URL = 'https://us.suunto.com/pages/suunto-app';

export default function SuuntoWatchImportPage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
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
  const isRussian = language === LANGUAGES.russian;
  const needsHealthConnectApp = Platform.OS === 'android' && Number(Platform.Version) < 34;

  const markUploadSkipped = useCallback((reason: UploadSkipReason, sourceWorkouts: WatchWorkout[] = []) => {
    setUploadDiagnostics({
      at: new Date().toISOString(),
      outcome: 'skipped',
      skipReason: reason,
      workoutCount: sourceWorkouts.length,
      sourceRoutePointCount: sourceWorkouts.reduce((total, workout) => total + workout.locations.length, 0),
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
        sourceRoutePointCount: sourceWorkouts.reduce((total, workout) => total + workout.locations.length, 0),
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
        const importResult = await sendWorkoutsToRunich(userId, result);
        setImportResult(
          isRussian
            ? `Автосинхронизация: новых тренировок ${importResult.imported}, уже были в Runich: ${importResult.skipped}.`
            : `Auto-sync: ${importResult.imported} new workouts, ${importResult.skipped} already in Runich.`,
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
          setError(isRussian ? 'Не удалось проверить подключение часов.' : 'Could not check the watch connection.');
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

  const selectedWorkouts = useMemo(
    () => workouts.filter((workout) => selectedIds.has(getWorkoutId(workout))),
    [selectedIds, workouts],
  );

  const steps =
    Platform.OS === 'ios'
      ? isRussian
        ? [
            {
              number: '1',
              title: 'Синхронизируйте часы с Suunto App',
              description:
                'Откройте Suunto App рядом с часами и дождитесь, пока завершённая тренировка появится в истории приложения.',
            },
            {
              number: '2',
              title: 'Настройте Health Sync',
              description:
                'Установите Health Sync, выберите Suunto как источник, Apple Health как приложение назначения и разрешите передачу тренировок и данных маршрута. Если синхронизация шла при заблокированном телефоне, откройте Health Sync ещё раз: приложение может добавить GPS-маршрут при следующем запуске.',
            },
            {
              number: '3',
              title: 'Разрешите Runich читать Apple Health',
              description:
                'Нажмите кнопку подключения ниже и разрешите Runich читать тренировки и доступные данные в системном окне Apple Health.',
            },
            {
              number: '4',
              title: 'Проверьте и импортируйте тренировки',
              description:
                'Runich покажет завершённые записи за последние 30 дней. Выберите нужные и нажмите «Импортировать выбранные». При следующих возвращениях новые записи будут синхронизироваться автоматически.',
            },
          ]
        : [
            {
              number: '1',
              title: 'Sync your watch with Suunto App',
              description:
                'Open Suunto App near your watch and wait for the completed workout to appear in its history.',
            },
            {
              number: '2',
              title: 'Set up Health Sync',
              description:
                'Install Health Sync, choose Suunto as the source and Apple Health as the destination, then allow workout and route data. If syncing happened while the phone was locked, open Health Sync again; it may add the GPS route on the next launch.',
            },
            {
              number: '3',
              title: 'Allow Runich to read Apple Health',
              description:
                'Tap the connection button below and allow Runich to read workouts in the Apple Health dialog.',
            },
            {
              number: '4',
              title: 'Review and import workouts',
              description:
                'Runich will show completed records from the last 30 days. Select the ones you want and tap Import selected. New records sync automatically when you return to Runich later.',
            },
          ]
      : isRussian
        ? [
            {
              number: '1',
              title: 'Синхронизируйте часы с Suunto App',
              description:
                'Откройте Suunto App рядом с часами и дождитесь, пока завершённая тренировка появится в истории приложения.',
            },
            {
              number: '2',
              title: 'Настройте Health Sync',
              description:
                'Установите Health Sync, выберите Suunto как источник, Health Connect как приложение назначения и разрешите передачу тренировок и GPS-данных.',
            },
            {
              number: '3',
              title: 'Разрешите Runich читать Health Connect',
              description:
                'Нажмите кнопку подключения ниже и разрешите Runich читать тренировки и доступные данные в системном окне Health Connect. Для GPS-маршрута Android может отдельно запросить доступ к маршруту конкретной тренировки.',
            },
            {
              number: '4',
              title: 'Проверьте и импортируйте тренировки',
              description:
                'Runich покажет завершённые записи за последние 30 дней. Выберите нужные и нажмите «Импортировать выбранные». При следующих возвращениях новые записи будут синхронизироваться автоматически.',
            },
          ]
        : [
            {
              number: '1',
              title: 'Sync your watch with Suunto App',
              description:
                'Open Suunto App near your watch and wait for the completed workout to appear in its history.',
            },
            {
              number: '2',
              title: 'Set up Health Sync',
              description:
                'Install Health Sync, choose Suunto as the source and Health Connect as the destination, then allow workout and GPS data.',
            },
            {
              number: '3',
              title: 'Allow Runich to read Health Connect',
              description:
                'Tap the connection button below and allow Runich to read workouts in the Health Connect dialog. Android may ask separately for access to an individual workout’s route.',
            },
            {
              number: '4',
              title: 'Review and import workouts',
              description:
                'Runich will show completed records from the last 30 days. Select the ones you want and tap Import selected. New records sync automatically when you return to Runich later.',
            },
          ];

  const connect = async () => {
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
  };

  const openExternalLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (openError) {
      setError(isRussian ? 'Не удалось открыть ссылку.' : 'Could not open the link.');
      errorToast('', openError);
    }
  };

  const openHealthConnectInstallPage = async () => {
    try {
      await Linking.openURL(HEALTH_CONNECT_PLAY_STORE_URL);
    } catch (openError) {
      setError(isRussian ? 'Не удалось открыть страницу Health Connect.' : 'Could not open the Health Connect page.');
      errorToast('', openError);
    }
  };

  const importSelected = async () => {
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
  };

  const toggleWorkout = (workout: WatchWorkout) => {
    const id = getWorkoutId(workout);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const title = isRussian ? 'Suunto: импорт тренировок' : 'Suunto workout import';
  const healthStoreName = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';
  const connectTitle = isRussian
    ? `Разрешить Runich читать ${healthStoreName}`
    : `Allow Runich to read ${healthStoreName}`;
  const diagnosticsCard = (
    <Card style={styles.diagnosticCard}>
      <Card.Content>
        <Text variant="titleMedium">{isRussian ? 'Диагностика импорта' : 'Import diagnostics'}</Text>
        <Text variant="bodySmall" style={styles.diagnosticText}>
          {isRussian
            ? `Платформа: ${Platform.OS} · хранилище: ${availability ?? 'проверяется'} · подключение: ${getBooleanLabel(isConnected, isRussian)} · аккаунт Runich: ${getBooleanLabel(Boolean(userId), isRussian)}`
            : `Platform: ${Platform.OS} · store: ${availability ?? 'checking'} · connected: ${getBooleanLabel(isConnected, isRussian)} · Runich account: ${getBooleanLabel(Boolean(userId), isRussian)}`}
        </Text>
        <Text variant="bodySmall" style={styles.diagnosticText}>
          {isRussian
            ? `Все обязательные разрешения на чтение: ${getBooleanLabel(healthPermissions?.granted, isRussian)}`
            : `All required read permissions: ${getBooleanLabel(healthPermissions?.granted, isRussian)}`}
        </Text>
        {Platform.OS === 'android' && (
          <Text variant="bodySmall" style={styles.diagnosticText}>
            {isRussian
              ? `Разрешения Health Connect: ExerciseSession ${getBooleanLabel(healthPermissions?.details?.exerciseSession, isRussian)} · Distance ${getBooleanLabel(healthPermissions?.details?.distance, isRussian)} · Steps ${getBooleanLabel(healthPermissions?.details?.steps, isRussian)}. Доступ к маршруту запрашивается отдельно для каждой записи.`
              : `Health Connect permissions: ExerciseSession ${getBooleanLabel(healthPermissions?.details?.exerciseSession, isRussian)} · Distance ${getBooleanLabel(healthPermissions?.details?.distance, isRussian)} · Steps ${getBooleanLabel(healthPermissions?.details?.steps, isRussian)}. Route access is requested separately for each record.`}
          </Text>
        )}
        {healthStatusErrorCode && (
          <Text variant="bodySmall" style={styles.diagnosticText}>
            {isRussian
              ? `Ошибка проверки/разрешения Health Connect: ${healthStatusErrorCode}`
              : `Health Connect status/permission error: ${healthStatusErrorCode}`}
          </Text>
        )}

        <Text variant="bodySmall" style={styles.diagnosticText}>
          {readDiagnostics
            ? isRussian
              ? `Последнее чтение: ${new Date(readDiagnostics.at).toLocaleString('ru-RU')} · период ${readDiagnostics.startDate.slice(0, 10)} — ${readDiagnostics.endDate.slice(0, 10)} · статус: ${readDiagnostics.outcome} · этап: ${readDiagnostics.stage ? getReadStageLabel(readDiagnostics.stage, isRussian) : 'неизвестен'}${readDiagnostics.sessionCount !== undefined ? ` · найдено: ${readDiagnostics.sessionCount}` : ''}${readDiagnostics.processedSessionCount !== undefined ? ` · обработано: ${readDiagnostics.processedSessionCount}${readDiagnostics.sessionCount !== undefined ? `/${readDiagnostics.sessionCount}` : ''}` : ''}${readDiagnostics.errorCode ? ` · ошибка ${readDiagnostics.errorCode}` : ''}`
              : `Last read: ${new Date(readDiagnostics.at).toLocaleString('en-US')} · range ${readDiagnostics.startDate.slice(0, 10)} — ${readDiagnostics.endDate.slice(0, 10)} · status: ${readDiagnostics.outcome} · stage: ${readDiagnostics.stage ? getReadStageLabel(readDiagnostics.stage, isRussian) : 'unknown'}${readDiagnostics.sessionCount !== undefined ? ` · found: ${readDiagnostics.sessionCount}` : ''}${readDiagnostics.processedSessionCount !== undefined ? ` · processed: ${readDiagnostics.processedSessionCount}${readDiagnostics.sessionCount !== undefined ? `/${readDiagnostics.sessionCount}` : ''}` : ''}${readDiagnostics.errorCode ? ` · error ${readDiagnostics.errorCode}` : ''}`
            : isRussian
              ? 'Чтение хранилища ещё не запускалось.'
              : 'Health store has not been read yet.'}
        </Text>
        {isReading && <ActivityIndicator size="small" style={styles.readingIndicator} />}

        {workouts.slice(0, 50).map((workout, index) => {
          const routePointCount = workout.diagnostics?.routePointCount ?? workout.locations.length;
          const recordId = workout.diagnostics?.sessionRecordId;
          return (
            <Text key={getWorkoutId(workout)} variant="bodySmall" style={styles.diagnosticWorkout}>
              {`${index + 1}. ${new Date(workout.date).toLocaleString(isRussian ? 'ru-RU' : 'en-US')} · ${workout.sport} · ${Math.round(workout.distance)} m · ${workout.duration ? Math.round(workout.duration / 60_000) : 0} min · ${isRussian ? 'источник' : 'origin'}: ${workout.diagnostics?.dataOrigin ?? 'unknown'} · ${isRussian ? 'маршрут' : 'route'}: ${getRouteStatusLabel(workout.diagnostics?.routeStatus, isRussian)} · ${isRussian ? 'точек' : 'points'}: ${routePointCount}${recordId ? ` · id: ${recordId.slice(-8)}` : ''}${workout.diagnostics?.routeErrorCode ? ` · error: ${workout.diagnostics.routeErrorCode}` : ''}`}
            </Text>
          );
        })}
        {workouts.length > 50 && (
          <Text variant="bodySmall" style={styles.diagnosticText}>
            {isRussian ? `Показаны первые 50 из ${workouts.length}.` : `Showing the first 50 of ${workouts.length}.`}
          </Text>
        )}

        <Text variant="bodySmall" style={styles.diagnosticText}>
          {uploadDiagnostics
            ? isRussian
              ? `Статус отправки в Runich: ${new Date(uploadDiagnostics.at).toLocaleString('ru-RU')} · ${uploadDiagnostics.outcome}${uploadDiagnostics.skipReason ? ` · причина: ${getUploadSkipReasonLabel(uploadDiagnostics.skipReason, isRussian)}` : ''} · тренировок ${uploadDiagnostics.workoutCount}${uploadDiagnostics.skipReason ? '' : ` · GPS-точек ${uploadDiagnostics.sourceRoutePointCount} → ${uploadDiagnostics.payloadRoutePointCount}`}${uploadDiagnostics.imported !== undefined ? ` · импортировано ${uploadDiagnostics.imported}, пропущено ${uploadDiagnostics.skipped}` : ''}${uploadDiagnostics.errorStatus ? ` · ответ/ошибка ${uploadDiagnostics.errorStatus}` : ''}`
              : `Runich upload status: ${new Date(uploadDiagnostics.at).toLocaleString('en-US')} · ${uploadDiagnostics.outcome}${uploadDiagnostics.skipReason ? ` · reason: ${getUploadSkipReasonLabel(uploadDiagnostics.skipReason, isRussian)}` : ''} · workouts ${uploadDiagnostics.workoutCount}${uploadDiagnostics.skipReason ? '' : ` · GPS points ${uploadDiagnostics.sourceRoutePointCount} → ${uploadDiagnostics.payloadRoutePointCount}`}${uploadDiagnostics.imported !== undefined ? ` · imported ${uploadDiagnostics.imported}, skipped ${uploadDiagnostics.skipped}` : ''}${uploadDiagnostics.errorStatus ? ` · response/error ${uploadDiagnostics.errorStatus}` : ''}`
            : isRussian
              ? 'Запрос на импорт ещё не запускался.'
              : 'No import request has been made yet.'}
        </Text>
        <Text variant="bodySmall" style={styles.diagnosticText}>
          {isRussian
            ? 'Первое подключение только читает хранилище: найденные записи нужно выбрать и импортировать кнопкой ниже. Диагностика показывает метаданные и число GPS-точек; координаты не отображаются.'
            : 'The first connection only reads the health store: select the found workouts and import them with the button below. Diagnostics show metadata and GPS point counts; coordinates are not displayed.'}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <>
      <Stack.Screen options={{ title }} />
      <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {isRussian
            ? `Цепочка передачи: часы → Suunto App → Health Sync → ${Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'} → Runich. Runich подключается к хранилищу телефона, а не напрямую к часам.`
            : `Workout flow: watch → Suunto App → Health Sync → ${Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'} → Runich. Runich connects to the phone’s health store, not directly to the watch.`}
        </Text>

        {diagnosticsCard}

        {Platform.OS !== 'web' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{isRussian ? 'Установите приложения' : 'Install the apps'}</Text>
              <Text variant="bodySmall" style={[styles.guideIntro, { color: colors.onSurfaceVariant }]}>
                {isRussian
                  ? 'Для этого маршрута нужны Suunto App и Health Sync. Откройте официальные страницы приложений ниже.'
                  : 'This flow uses Suunto App and Health Sync. Open their official app pages below.'}
              </Text>
              <Button compact mode="outlined" onPress={() => void openExternalLink(SUUNTO_APP_URL)}>
                {isRussian ? 'Страница приложения Suunto' : 'Suunto app page'}
              </Button>
              <Button
                compact
                mode="outlined"
                onPress={() =>
                  void openExternalLink(Platform.OS === 'ios' ? HEALTH_SYNC_APP_STORE_URL : HEALTH_SYNC_PLAY_STORE_URL)
                }>
                {Platform.OS === 'ios'
                  ? isRussian
                    ? 'Health Sync в App Store'
                    : 'Health Sync on App Store'
                  : isRussian
                    ? 'Health Sync в Google Play'
                    : 'Health Sync on Google Play'}
              </Button>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 6 }}>
                {Platform.OS === 'android'
                  ? isRussian
                    ? 'У Health Sync есть недельный пробный период, затем нужна лицензия. Проверьте наличие приложения в Google Play для своего региона.'
                    : 'Health Sync has a one-week free trial; a license is required afterward. Check Google Play availability in your region.'
                  : isRussian
                    ? 'Проверьте цену и условия покупки Health Sync в App Store.'
                    : 'Check Health Sync pricing and purchase terms in the App Store.'}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.noteCard}>
          <Card.Content>
            <Text variant="titleSmall">
              {isRussian ? 'Что произойдёт с маршрутом GPS' : 'What happens to the GPS route'}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
              {Platform.OS === 'ios'
                ? isRussian
                  ? 'Health Sync поддерживает передачу тренировок Suunto в Apple Health и GPS-данных. Если синхронизация прошла при заблокированном телефоне, откройте Health Sync ещё раз. Проверьте на одной новой тренировке, что маршрут появился в Apple Health и затем в Runich.'
                  : 'Health Sync supports syncing Suunto workouts and GPS data to Apple Health. If syncing happened while the phone was locked, open Health Sync again. Verify with one new workout that its route appears in Apple Health and then in Runich.'
                : isRussian
                  ? 'Health Sync поддерживает передачу GPS-данных между приложениями через Health Connect. Проверьте на одной новой тренировке, что маршрут появился в Health Connect: доступ к маршрутам выдаётся отдельно, и передача зависит от поддержки источника и назначения.'
                  : 'Health Sync supports syncing GPS data between apps through Health Connect. Verify with one new workout that its route appears in Health Connect: route access is granted separately, and transfer depends on source and destination support.'}
            </Text>
          </Card.Content>
        </Card>

        {Platform.OS === 'android' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleSmall">{isRussian ? 'Инструкция Health Sync' : 'Health Sync guide'}</Text>
              <Button compact mode="text" onPress={() => void openExternalLink(HEALTH_SYNC_GUIDE_URL)}>
                {isRussian ? 'Какие данные синхронизирует Health Sync' : 'What Health Sync can sync'}
              </Button>
              <Button
                compact
                mode="text"
                onPress={() =>
                  void openExternalLink(
                    `https://support.google.com/android/answer/12201227?hl=${isRussian ? 'ru' : 'en'}`,
                  )
                }>
                {isRussian ? 'Как открыть Health Connect' : 'How to open Health Connect'}
              </Button>
            </Card.Content>
          </Card>
        )}
        {Platform.OS === 'ios' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleSmall">{isRussian ? 'Инструкция Health Sync' : 'Health Sync guide'}</Text>
              <Button compact mode="text" onPress={() => void openExternalLink(HEALTH_SYNC_GUIDE_URL)}>
                {isRussian ? 'Какие данные синхронизирует Health Sync' : 'What Health Sync can sync'}
              </Button>
            </Card.Content>
          </Card>
        )}

        {steps.map((step) => (
          <Card key={step.number} style={styles.card}>
            <Card.Content>
              <View style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    {step.number}
                  </Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text variant="titleMedium">{step.title}</Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {step.description}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">{isRussian ? 'Если тренировка не появилась' : 'If a workout is missing'}</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
              {Platform.OS === 'ios'
                ? isRussian
                  ? 'Проверьте, что тренировка есть в Suunto App, а в Health Sync выбраны источник Suunto и Apple Health как назначение. Если синхронизация шла при заблокированном телефоне, откройте Health Sync. Затем вернитесь сюда и нажмите «Обновить и синхронизировать».'
                  : 'Check that the workout appears in Suunto App and Health Sync is configured with Suunto as source and Apple Health as destination. If syncing happened while the phone was locked, open Health Sync. Then return here and tap Refresh and sync.'
                : isRussian
                  ? 'Проверьте, что тренировка есть в Suunto App, а в Health Sync выбраны источник Suunto и Health Connect как назначение. Проверьте в разрешениях Health Connect доступ Health Sync на запись тренировок и маршрутов. Затем вернитесь сюда и нажмите «Обновить и синхронизировать». При первом чтении маршрута Runich может показать отдельный системный запрос разового доступа — подтвердите его, если хотите импортировать GPS.'
                  : 'Check that the workout appears in Suunto App and Health Sync is configured with Suunto as source and Health Connect as destination. Check that Health Sync can write workouts and routes in Health Connect permissions. Then return here and tap Refresh and sync. When Runich first reads a route, Android may show a separate one-time access prompt; grant it if you want to import GPS data.'}
            </Text>
          </Card.Content>
        </Card>

        {isLoading && !availability ? (
          <ActivityIndicator style={styles.loader} />
        ) : availability === 'provider-update-required' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">
                {isRussian
                  ? 'Обновите Health Connect через Google Play, затем вернитесь сюда и повторите подключение.'
                  : 'Update Health Connect through Google Play, then return here and connect again.'}
              </Text>
              <Button compact mode="outlined" onPress={() => void openHealthConnectInstallPage()}>
                {isRussian ? 'Открыть Google Play' : 'Open Google Play'}
              </Button>
              <Button compact mode="text" loading={isLoading} onPress={() => void refreshHealthConnection()}>
                {isRussian ? 'Проверить ещё раз' : 'Check again'}
              </Button>
            </Card.Content>
          </Card>
        ) : availability === 'provider-not-available' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">
                {isRussian
                  ? 'Health Connect не найден или не настроен. На Android 14 и новее откройте его через поиск в системных настройках. На Android 13 и старше установите приложение Health Connect из Google Play. Нужны Android 9 или новее и сервисы Google Play.'
                  : 'Health Connect was not found or is not set up. On Android 14 or later, open it by searching in system Settings. On Android 13 or earlier, install the Health Connect app from Google Play. Android 9 or later and Google Play services are required.'}
              </Text>
              {needsHealthConnectApp && (
                <Button compact mode="outlined" onPress={() => void openHealthConnectInstallPage()}>
                  {isRussian ? 'Открыть страницу Health Connect' : 'Open Health Connect page'}
                </Button>
              )}
              <Button compact mode="text" loading={isLoading} onPress={() => void refreshHealthConnection()}>
                {isRussian ? 'Проверить ещё раз' : 'Check again'}
              </Button>
            </Card.Content>
          </Card>
        ) : availability === 'not-supported' || Platform.OS === 'web' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">
                {Platform.OS === 'android'
                  ? isRussian
                    ? 'Для Health Connect нужен Android 9 или новее и сервисы Google Play.'
                    : 'Health Connect requires Android 9 or later and Google Play services.'
                  : Platform.OS === 'ios'
                    ? isRussian
                      ? 'Apple Health недоступен на этом устройстве.'
                      : 'Apple Health is not available on this device.'
                    : isRussian
                      ? 'Системное хранилище тренировок недоступно на этой платформе.'
                      : 'The system workout store is not available on this platform.'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {!isConnected && (
              <Button mode="contained" onPress={connect} loading={isLoading} style={styles.button}>
                {connectTitle}
              </Button>
            )}

            {isConnected && (
              <Card style={styles.statusCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={{ color: colors.primary }}>
                    {isRussian ? 'Хранилище подключено' : 'Health store connected'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {isRussian
                      ? 'После возвращения в Runich новые завершённые тренировки проверяются и отправляются автоматически. Повторные записи не создаются.'
                      : 'When you return to Runich, new completed workouts are checked and uploaded automatically. Existing records are skipped.'}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {isConnected && (
              <Button
                mode="outlined"
                onPress={() => void syncLatestWorkouts(true)}
                loading={isReading || isAutoSyncing}
                style={styles.button}>
                {isRussian ? 'Обновить и синхронизировать' : 'Refresh and sync'}
              </Button>
            )}

            {error && <Text style={[styles.message, { color: colors.error }]}>{error}</Text>}
            {importResult && <Text style={[styles.message, { color: colors.primary }]}>{importResult}</Text>}

            {isReading ? (
              <ActivityIndicator style={styles.loader} />
            ) : workouts.length === 0 && isConnected ? (
              <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
                {isRussian
                  ? 'Завершённых тренировок за последние 30 дней нет.'
                  : 'No completed workouts in the last 30 days.'}
              </Text>
            ) : (
              workouts.map((workout, index) => {
                const id = getWorkoutId(workout);
                const checked = selectedIds.has(id);
                return (
                  <Card key={id} style={styles.card}>
                    <Card.Content>
                      <View style={styles.row}>
                        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => toggleWorkout(workout)} />
                        <View style={styles.copy}>
                          <Text variant="titleMedium">{workout.title || workout.sport}</Text>
                          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                            {new Date(workout.date).toLocaleString(isRussian ? 'ru-RU' : 'en-US')} ·{' '}
                            {Math.round(workout.distance)} m · {Math.round(workout.duration / 60_000)} min
                          </Text>
                        </View>
                      </View>
                      {index < workouts.length - 1 && <Divider style={styles.divider} />}
                    </Card.Content>
                  </Card>
                );
              })
            )}

            {isConnected && workouts.length > 0 && (
              <Button
                mode="contained"
                onPress={() => void importSelected()}
                loading={isImporting}
                disabled={isImporting || selectedWorkouts.length === 0}
                style={styles.button}>
                {isRussian
                  ? `Импортировать выбранные (${selectedWorkouts.length})`
                  : `Import selected (${selectedWorkouts.length})`}
              </Button>
            )}
          </>
        )}
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  title: { marginBottom: 2 },
  card: { marginTop: 2 },
  statusCard: { marginTop: 2, borderColor: '#4caf50', borderWidth: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { flex: 1, gap: 4 },
  guideIntro: { marginTop: 4 },
  noteCard: { marginTop: 2, borderColor: '#d58a21', borderWidth: 1 },
  diagnosticCard: { marginTop: 8, borderColor: '#607d8b', borderWidth: 1 },
  diagnosticText: { marginTop: 6, color: '#607d8b' },
  diagnosticWorkout: { marginTop: 5 },
  readingIndicator: { alignSelf: 'flex-start', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  copy: { flex: 1, gap: 2 },
  divider: { marginTop: 10 },
  button: { marginTop: 6 },
  message: { marginTop: 8 },
  loader: { marginVertical: 24 },
});
