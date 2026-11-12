import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { RunichHealth } from '../../../modules/runich-health/src/RunichHealth';
import {
  getAutoSyncKey,
  getConnectionKey,
  getDiagnosticErrorCode,
  getHealthKitAuthorizationRequestKey,
  HIDDEN_WORKOUTS_KEY,
} from './helpers';
import type {
  HealthAvailability,
  HealthPermissionsResult,
  WatchWorkout,
} from '../../../modules/runich-health/src/RunichHealth';

interface UseWorkoutImportConnectionOptions {
  autoSync: boolean;
  autoSyncEnabled: boolean;
  enabled: boolean;
  isRussian: boolean;
  userId: string | null;
  readWorkouts: () => Promise<WatchWorkout[] | null>;
  restoreAutoSyncEnabled: (enabled: boolean) => void;
  restoreHiddenWorkoutIds: (savedValue: string | null) => void;
  setAutoSyncEnabled: (enabled: boolean) => Promise<void>;
  setError: Dispatch<SetStateAction<string | null>>;
  setHealthStatusErrorCode: Dispatch<SetStateAction<string | null>>;
  setImportResult: Dispatch<SetStateAction<string | null>>;
  syncLatestWorkouts: (autoImport: boolean, autoImportAllowed?: boolean) => Promise<void>;
}

export function useWorkoutImportConnection({
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
}: UseWorkoutImportConnectionOptions) {
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);
  const [healthPermissions, setHealthPermissions] = useState<HealthPermissionsResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshHealthConnection = useCallback(
    async (isActive: () => boolean = () => true) => {
      setIsLoading(true);
      setError(null);
      setHealthStatusErrorCode(null);
      const connectionKey =
        Platform.OS === 'ios' ? getHealthKitAuthorizationRequestKey(userId) : getConnectionKey(userId);
      const savedConnection = connectionKey ? SecureStore.getItemAsync(connectionKey) : Promise.resolve(null);
      const autoSyncKey = getAutoSyncKey(userId);
      const savedAutoSync = autoSyncKey ? SecureStore.getItemAsync(autoSyncKey) : Promise.resolve(null);
      const savedHiddenWorkouts = SecureStore.getItemAsync(HIDDEN_WORKOUTS_KEY);

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

        restoreHiddenWorkoutIds(savedHiddenWorkoutsValue);
        setAvailability(nextAvailability);
        setHealthPermissions(permissions);
        const savedAutoSyncEnabled = savedAutoSyncValue !== 'false';
        restoreAutoSyncEnabled(savedAutoSyncEnabled);
        const connected =
          permissions.available &&
          (Platform.OS === 'ios'
            ? savedConnectionValue === 'true'
            : permissions.granted || savedConnectionValue === 'true');
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
    [
      autoSync,
      isRussian,
      readWorkouts,
      restoreAutoSyncEnabled,
      restoreHiddenWorkoutIds,
      setError,
      setHealthStatusErrorCode,
      syncLatestWorkouts,
      userId,
    ],
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
      const connected = permissions.available && (Platform.OS === 'ios' || permissions.granted === true);
      setIsConnected(connected);
      if (!connected) {
        setError(isRussian ? 'Доступ к тренировкам не предоставлен.' : 'Workout access was not granted.');
        return;
      }
      const connectionKey =
        Platform.OS === 'ios' ? getHealthKitAuthorizationRequestKey(userId) : getConnectionKey(userId);
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
  }, [isRussian, setAutoSyncEnabled, setError, setHealthStatusErrorCode, setImportResult, syncLatestWorkouts, userId]);

  return { availability, connect, healthPermissions, isConnected, isLoading, refreshHealthConnection };
}
