import { formatWorkoutDiagnostics, getAutoSyncKey, getReadDiagnosticItems, getUploadDiagnosticItems } from './helpers';
import type { ReadDiagnostics, UploadDiagnostics } from './types';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';

const workout: WatchWorkout = {
  source: 'health-connect',
  sourceActivityId: 'record-12345678',
  date: '2026-10-08T07:00:00.000Z',
  timeZone: 'Europe/Moscow',
  sport: 'run',
  duration: 600_000,
  distance: 2_000,
  locations: [{ timestamp: 1_000, coords: { latitude: 55.75, longitude: 37.61 } }],
  diagnostics: {
    dataOrigin: 'com.example.watch',
    sessionRecordId: 'record-12345678',
    routeStatus: 'route-in-record',
    routePointCount: 1,
  },
};

describe('watch import diagnostics helpers', () => {
  it('creates a user-scoped auto-sync marker key', () => {
    expect(getAutoSyncKey('user-1')).toBe('runich.watch.auto-sync.enabled.user-1');
    expect(getAutoSyncKey(null)).toBeNull();
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

  it('shows why upload was skipped and formats workout metadata separately', () => {
    const diagnostics: UploadDiagnostics = {
      at: '2026-10-08T08:00:00.000Z',
      outcome: 'skipped',
      workoutCount: 1,
      sourceRoutePointCount: 1,
      payloadRoutePointCount: 0,
      skipReason: 'manual-selection',
    };

    expect(getUploadDiagnosticItems(diagnostics, true)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'причина', value: 'ожидается выбор тренировок для первого импорта' }),
        expect.objectContaining({ label: 'тренировок', value: '1' }),
      ]),
    );
    expect(formatWorkoutDiagnostics(workout, 0, true)).toContain('источник: com.example.watch');
    expect(formatWorkoutDiagnostics(workout, 0, true)).toContain('маршрут: маршрут в записи');
  });
});
