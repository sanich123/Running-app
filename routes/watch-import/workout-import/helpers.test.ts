import { WORKOUT_IMPORT_COPY } from './const';
import {
  formatImportSelectedLabel,
  getAutoSyncKey,
  getBooleanLabel,
  getConnectionKey,
  getHealthKitAuthorizationRequestKey,
  getDiagnosticErrorCode,
  getReadDiagnosticItems,
  getReadStageLabel,
  getRequestErrorStatus,
  getRoutePointCount,
  getUploadDiagnosticItems,
  getUploadSkipReasonLabel,
  getWorkoutId,
  splitWatchWorkoutsIntoBatches,
} from './helpers';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';
import type { ReadDiagnostics, UploadDiagnostics, UploadSkipReason } from './types';

const workout: WatchWorkout = {
  source: 'health-connect',
  sourceActivityId: 'record-12345678',
  date: '2026-10-08T07:00:00.000Z',
  timeZone: 'Europe/Moscow',
  sport: 'run',
  duration: 600_000,
  distance: 2_000,
  locations: [{ timestamp: 1_000, coords: { latitude: 55.75, longitude: 37.61 } }],
  heartRateSamples: [{ timestamp: 1_000, beatsPerMinute: 140 }],
};

describe('watch import diagnostics helpers', () => {
  it('creates a user-scoped auto-sync marker key', () => {
    expect(getAutoSyncKey('user-1')).toBe('runich.watch.auto-sync.enabled.user-1');
    expect(getAutoSyncKey(null)).toBeNull();
  });

  it('creates a user-scoped HealthKit authorization request key only for signed-in users', () => {
    expect(getHealthKitAuthorizationRequestKey('user-1')).toBe('runich.healthkit.authorization-requested.user-1');
    expect(getHealthKitAuthorizationRequestKey(null)).toBeNull();
  });

  it('formats read diagnostics as structured label/value items', () => {
    const diagnostics: ReadDiagnostics = {
      at: '2026-10-08T08:00:00.000Z',
      startDate: '2026-09-08T08:00:00.000Z',
      endDate: '2026-10-08T08:00:00.000Z',
      outcome: 'success',
      workoutCount: 1,
      stage: 'complete',
      sessionCount: 1,
      processedSessionCount: 1,
    };

    expect(getReadDiagnosticItems(diagnostics, true)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'статус', value: 'успешно', tone: 'success' }),
        expect.objectContaining({ label: 'найдено', value: '1' }),
        expect.objectContaining({ label: 'обработано', value: '1/1' }),
      ]),
    );
  });

  it('shows why upload was skipped', () => {
    const diagnostics: UploadDiagnostics = {
      at: '2026-10-08T08:00:00.000Z',
      outcome: 'skipped',
      workoutCount: 1,
      sourceRoutePointCount: 1,
      payloadRoutePointCount: 0,
      sourceHeartRateSampleCount: 1,
      payloadHeartRateSampleCount: 0,
      workouts: [
        {
          source: 'health-connect',
          sourceActivityId: workout.sourceActivityId,
          sourceHeartRateSampleCount: 1,
          payloadHeartRateSampleCount: 0,
          outcome: 'not-sent',
        },
      ],
      skipReason: 'manual-selection',
    };

    expect(getUploadDiagnosticItems(diagnostics, true)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'причина', value: 'выберите тренировки для первого импорта' }),
        expect.objectContaining({ label: 'тренировок', value: '1' }),
        expect.objectContaining({ label: 'пульс (Health Connect → Runich)', value: '1 → 0' }),
      ]),
    );
  });

  it('formats errors and labels for both languages and missing values', () => {
    expect(getDiagnosticErrorCode(null)).toBe('UnknownError');
    expect(getDiagnosticErrorCode('offline')).toBe('UnknownError');
    expect(getDiagnosticErrorCode({ code: 'READ_FAILED', name: 'IgnoredName' })).toBe('READ_FAILED');
    expect(getDiagnosticErrorCode({ name: 'NetworkError' })).toBe('NetworkError');
    expect(getDiagnosticErrorCode({ code: 4, name: 5 })).toBe('UnknownError');

    expect(getRequestErrorStatus({ status: 503 })).toBe('503');
    expect(getRequestErrorStatus({ status: '429' })).toBe('429');
    expect(getRequestErrorStatus({ status: null, code: 'RATE_LIMITED' })).toBe('RATE_LIMITED');

    expect(getBooleanLabel(undefined, true)).toBe('неизвестно');
    expect(getBooleanLabel(undefined, false)).toBe(WORKOUT_IMPORT_COPY.en.diagnostics.unknownStage);
    expect(getBooleanLabel(true, true)).toBe('да');
    expect(getBooleanLabel(true, false)).toBe('yes');
    expect(getBooleanLabel(false, true)).toBe('нет');
    expect(getBooleanLabel(false, false)).toBe('no');

    for (const stage of [
      'availability',
      'exercise-sessions',
      'workout-measurements',
      'exercise-route',
      'complete',
    ] as const) {
      expect(getReadStageLabel(stage, true)).not.toBe(getReadStageLabel(stage, false));
    }
    for (const reason of [
      'read-failed',
      'no-user',
      'no-workouts',
      'manual-selection',
    ] as const satisfies readonly UploadSkipReason[]) {
      expect(getUploadSkipReasonLabel(reason, true)).not.toBe(getUploadSkipReasonLabel(reason, false));
    }

    expect(getWorkoutId(workout)).toBe('health-connect:record-12345678');
    expect(getConnectionKey('user-1')).toBe('runich.watch.connected.user-1');
    expect(getConnectionKey(null)).toBeNull();
    expect(getRoutePointCount([workout, { ...workout, locations: [] }])).toBe(1);
    expect(formatImportSelectedLabel(2, true)).toBe('Импортировать выбранные (2)');
    expect(formatImportSelectedLabel(2, false)).toBe('Import selected (2)');
  });

  it('splits watch uploads at the workout and UTF-8 byte limits', () => {
    const makeUpload = (sourceActivityId: string, title?: string) => ({
      source: 'health-connect' as const,
      sourceActivityId,
      sport: 'run',
      duration: 60_000,
      distance: 500,
      speed: 8.3,
      locations: [],
      ...(title === undefined ? {} : { title }),
    });

    expect(splitWatchWorkoutsIntoBatches('пользователь🏃', [])).toEqual([]);
    expect(splitWatchWorkoutsIntoBatches('пользователь🏃', [makeUpload('one')])).toEqual([[makeUpload('one')]]);

    const countLimited = Array.from({ length: 51 }, (_, index) => makeUpload(`workout-${index}`));
    const countBatches = splitWatchWorkoutsIntoBatches('user', countLimited);
    expect(countBatches.map((batch) => batch.length)).toEqual([50, 1]);
    expect(countBatches.flat()).toEqual(countLimited);

    const sizeLimited = [makeUpload('first', 'я'.repeat(1_100_000)), makeUpload('second', 'é'.repeat(1_100_000))];
    const sizeBatches = splitWatchWorkoutsIntoBatches('user', sizeLimited);
    expect(sizeBatches).toEqual([[sizeLimited[0]], [sizeLimited[1]]]);
    expect(() => splitWatchWorkoutsIntoBatches('user', [makeUpload('too-large', 'x'.repeat(4 * 1024 * 1024))])).toThrow(
      'An imported workout exceeds the upload size limit.',
    );
  });

  it('shows read and upload diagnostics for errors, in-progress states, and optional response fields', () => {
    expect(getReadDiagnosticItems(null, false)).toEqual([
      expect.objectContaining({ tone: 'muted', value: 'Health store has not been read yet.' }),
    ]);

    const readError: ReadDiagnostics = {
      at: '2026-10-08T08:00:00.000Z',
      startDate: '2026-09-08T08:00:00.000Z',
      endDate: '2026-10-08T08:00:00.000Z',
      outcome: 'error',
      workoutCount: 0,
      processedSessionCount: 3,
      errorCode: 'READ_FAILED',
    };
    expect(getReadDiagnosticItems(readError, false)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tone: 'error', value: 'error' }),
        expect.objectContaining({ value: 'unknown' }),
        expect.objectContaining({ value: '3' }),
        expect.objectContaining({ tone: 'error', value: 'READ_FAILED' }),
      ]),
    );

    const reading: ReadDiagnostics = {
      at: '2026-10-08T08:00:00.000Z',
      startDate: '2026-09-08T08:00:00.000Z',
      endDate: '2026-10-08T08:00:00.000Z',
      outcome: 'reading',
      workoutCount: 2,
      stage: 'exercise-sessions',
      sessionCount: 4,
    };
    expect(getReadDiagnosticItems(reading, true)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tone: 'default', value: 'выполняется' }),
        expect.objectContaining({ value: 'чтение списка тренировок' }),
        expect.objectContaining({ value: '4' }),
      ]),
    );

    expect(getUploadDiagnosticItems(null, false)).toEqual([
      expect.objectContaining({ tone: 'muted', value: 'No import request has been made yet.' }),
    ]);
    const uploaded: UploadDiagnostics = {
      at: '2026-10-08T08:00:00.000Z',
      outcome: 'error',
      workoutCount: 2,
      sourceRoutePointCount: 10,
      payloadRoutePointCount: 8,
      sourceHeartRateSampleCount: 12,
      payloadHeartRateSampleCount: 10,
      workouts: [
        {
          source: 'health-connect',
          sourceActivityId: workout.sourceActivityId,
          sourceHeartRateSampleCount: 2,
          payloadHeartRateSampleCount: 2,
          outcome: 'error',
        },
      ],
      imported: 1,
      skipped: 1,
      errorStatus: '503',
    };
    expect(getUploadDiagnosticItems(uploaded, false)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tone: 'error', value: 'error' }),
        expect.objectContaining({ label: 'GPS points', value: '10 → 8' }),
        expect.objectContaining({ label: 'Heart rate (Health Connect → Runich)', value: '12 → 10' }),
        expect.objectContaining({ label: 'imported', tone: 'success', value: '1' }),
        expect.objectContaining({ label: 'skipped', value: '1' }),
        expect.objectContaining({ label: 'response/error', tone: 'error', value: '503' }),
      ]),
    );
    const sending: UploadDiagnostics = { ...uploaded, outcome: 'sending', imported: undefined, skipped: undefined };
    expect(getUploadDiagnosticItems(sending, true)).toEqual(
      expect.arrayContaining([expect.objectContaining({ tone: 'default', value: 'выполняется' })]),
    );
  });
});
