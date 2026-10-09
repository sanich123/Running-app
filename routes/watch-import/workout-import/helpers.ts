import { WORKOUT_IMPORT_COPY, READ_STAGE_LABELS, ROUTE_STATUS_LABELS, UPLOAD_SKIP_REASON_LABELS } from './const';
import type { DiagnosticItem, ReadDiagnostics, UploadDiagnostics, UploadSkipReason } from './types';
import type {
  HealthConnectReadStage,
  WatchWorkout,
  WatchWorkoutRouteStatus,
} from '../../../modules/runich-health/src/RunichHealth';

export function getDiagnosticErrorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return 'UnknownError';
  if ('code' in error && typeof error.code === 'string') return error.code;
  if ('name' in error && typeof error.name === 'string') return error.name;
  return 'UnknownError';
}

export function getRequestErrorStatus(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = error.status;
    if (typeof status === 'number' || typeof status === 'string') return String(status);
  }
  return getDiagnosticErrorCode(error);
}

export function getRouteStatusLabel(status: WatchWorkoutRouteStatus | undefined, isRussian: boolean): string {
  if (!status) return isRussian ? 'статус маршрута недоступен' : 'route status unavailable';
  return ROUTE_STATUS_LABELS[status][isRussian ? 0 : 1];
}

export function getBooleanLabel(value: boolean | undefined, isRussian: boolean): string {
  if (value === undefined) return isRussian ? 'неизвестно' : 'unknown';
  return value ? (isRussian ? 'да' : 'yes') : isRussian ? 'нет' : 'no';
}

export function getReadStageLabel(stage: HealthConnectReadStage, isRussian: boolean): string {
  return READ_STAGE_LABELS[stage][isRussian ? 0 : 1];
}

export function getUploadSkipReasonLabel(reason: UploadSkipReason, isRussian: boolean): string {
  return UPLOAD_SKIP_REASON_LABELS[reason][isRussian ? 0 : 1];
}

export function getWorkoutId(workout: WatchWorkout): string {
  return `${workout.source}:${workout.sourceActivityId}`;
}

export function getConnectionKey(userId: string | null): string | null {
  return userId ? `runich.watch.connected.${userId}` : null;
}

export function getAutoSyncKey(userId: string | null): string | null {
  return userId ? `runich.watch.auto-sync.enabled.${userId}` : null;
}

export function getRoutePointCount(workouts: WatchWorkout[]): number {
  return workouts.reduce((total, workout) => total + workout.locations.length, 0);
}

export function getReadDiagnosticItems(diagnostics: ReadDiagnostics | null, isRussian: boolean): DiagnosticItem[] {
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;
  if (!diagnostics) return [{ label: copy.status, tone: 'muted', value: copy.noRead }];

  const dateLocale = isRussian ? 'ru-RU' : 'en-US';
  const items: DiagnosticItem[] = [
    { label: copy.lastRead, value: new Date(diagnostics.at).toLocaleString(dateLocale) },
    { label: copy.range, value: `${diagnostics.startDate.slice(0, 10)} — ${diagnostics.endDate.slice(0, 10)}` },
    {
      label: copy.status,
      tone: diagnostics.outcome === 'error' ? 'error' : diagnostics.outcome === 'success' ? 'success' : 'default',
      value: copy.readOutcomes[diagnostics.outcome],
    },
    {
      label: copy.stage,
      value: diagnostics.stage ? getReadStageLabel(diagnostics.stage, isRussian) : copy.unknownStage,
    },
  ];
  if (diagnostics.sessionCount !== undefined)
    items.push({ label: copy.found, value: String(diagnostics.sessionCount) });
  if (diagnostics.processedSessionCount !== undefined) {
    const total = diagnostics.sessionCount === undefined ? '' : `/${diagnostics.sessionCount}`;
    items.push({ label: copy.processed, value: `${diagnostics.processedSessionCount}${total}` });
  }
  if (diagnostics.errorCode) items.push({ label: copy.error, tone: 'error', value: diagnostics.errorCode });
  return items;
}

export function formatWorkoutDiagnostics(workout: WatchWorkout, index: number, isRussian: boolean): string {
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;
  const routePointCount = workout.diagnostics?.routePointCount ?? workout.locations.length;
  const recordId = workout.diagnostics?.sessionRecordId;
  const details = [
    `${index + 1}. ${new Date(workout.date).toLocaleString(isRussian ? 'ru-RU' : 'en-US')}`,
    workout.sport,
    `${Math.round(workout.distance)} m`,
    `${workout.duration ? Math.round(workout.duration / 60_000) : 0} min`,
    `${copy.origin}: ${workout.diagnostics?.dataOrigin ?? 'unknown'}`,
    `${copy.route}: ${getRouteStatusLabel(workout.diagnostics?.routeStatus, isRussian)}`,
    `${copy.points}: ${routePointCount}`,
  ];
  if (recordId) details.push(`id: ${recordId.slice(-8)}`);
  if (workout.diagnostics?.routeErrorCode) details.push(`error: ${workout.diagnostics.routeErrorCode}`);
  return details.join(' · ');
}

export function formatWorkoutCountNotice(count: number, isRussian: boolean): string {
  const template = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics.showingFirst;
  return template.replace('{shown}', '50').replace('{total}', String(count));
}

export function getUploadDiagnosticItems(diagnostics: UploadDiagnostics | null, isRussian: boolean): DiagnosticItem[] {
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;
  if (!diagnostics) return [{ label: copy.status, tone: 'muted', value: copy.noUpload }];

  const dateLocale = isRussian ? 'ru-RU' : 'en-US';
  const items: DiagnosticItem[] = [
    { label: copy.uploadStatus, value: new Date(diagnostics.at).toLocaleString(dateLocale) },
    {
      label: copy.status,
      tone: diagnostics.outcome === 'error' ? 'error' : diagnostics.outcome === 'success' ? 'success' : 'default',
      value: copy.uploadOutcomes[diagnostics.outcome],
    },
  ];
  if (diagnostics.skipReason)
    items.push({ label: copy.reason, value: getUploadSkipReasonLabel(diagnostics.skipReason, isRussian) });
  items.push({ label: copy.workouts, value: String(diagnostics.workoutCount) });
  if (!diagnostics.skipReason) {
    items.push({
      label: copy.gpsPoints,
      value: `${diagnostics.sourceRoutePointCount} → ${diagnostics.payloadRoutePointCount}`,
    });
  }
  if (diagnostics.imported !== undefined) {
    items.push({ label: copy.imported, tone: 'success', value: String(diagnostics.imported) });
    items.push({ label: copy.skipped, value: String(diagnostics.skipped) });
  }
  if (diagnostics.errorStatus) items.push({ label: copy.responseError, tone: 'error', value: diagnostics.errorStatus });
  return items;
}

export function formatImportSelectedLabel(count: number, isRussian: boolean): string {
  return WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].importSelected.replace('{count}', String(count));
}
