import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import {
  getAndroidAvailability,
  getAndroidPermissions,
  getDiagnosticErrorCode,
  readAndroidWorkouts,
  requestAndroidPermissions,
} from './health-connect.android';
import {
  HealthConnectReadError,
  type HealthAvailability,
  type HealthConnectReadProgress,
  type HealthConnectReadStage,
  type HealthPermissionsResult,
  type WatchWorkout,
} from './types';

export * from './types';

interface RunichHealthNativeModule {
  getAvailability(): Promise<HealthAvailability>;
  getPermissions(): Promise<HealthPermissionsResult>;
  requestPermissions(): Promise<HealthPermissionsResult>;
  readWorkouts(startDate: string, endDate: string): Promise<WatchWorkout[]>;
}

const nativeModule =
  Platform.OS === 'ios' ? requireOptionalNativeModule<RunichHealthNativeModule>('RunichHealth') : null;

function unavailable<T>(method: string): Promise<T> {
  return Promise.reject(new Error(`RunichHealth.${method} недоступен на этой платформе`));
}

export const RunichHealth = {
  getAvailability(): Promise<HealthAvailability> {
    if (Platform.OS === 'android') return getAndroidAvailability();
    return nativeModule?.getAvailability() ?? Promise.resolve('not-supported');
  },
  getPermissions(): Promise<HealthPermissionsResult> {
    if (Platform.OS === 'android') return getAndroidPermissions();
    return nativeModule?.getPermissions() ?? Promise.resolve({ available: false, granted: false });
  },
  async requestPermissions(): Promise<HealthPermissionsResult> {
    if (Platform.OS === 'android') {
      return requestAndroidPermissions();
    }
    return nativeModule?.requestPermissions() ?? unavailable('requestPermissions');
  },
  readWorkouts(
    startDate: string,
    endDate: string,
    onProgress?: (progress: HealthConnectReadProgress) => void,
  ): Promise<WatchWorkout[]> {
    if (Platform.OS === 'android') {
      let stage: HealthConnectReadStage = 'availability';
      return readAndroidWorkouts(startDate, endDate, (progress) => {
        stage = progress.stage;
        onProgress?.(progress);
      }).catch((error: unknown) => {
        if (error instanceof HealthConnectReadError) throw error;
        throw new HealthConnectReadError(stage, getDiagnosticErrorCode(error));
      });
    }
    onProgress?.({ stage: 'availability' });
    return (nativeModule?.readWorkouts(startDate, endDate) ?? unavailable<WatchWorkout[]>('readWorkouts')).then(
      (workouts) => {
        onProgress?.({ stage: 'complete', sessionCount: workouts.length, processedSessionCount: workouts.length });
        return workouts;
      },
    );
  },
};
