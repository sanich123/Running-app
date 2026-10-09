import { WORKOUT_IMPORT_COPY, READ_STAGE_LABELS, ROUTE_STATUS_LABELS, UPLOAD_SKIP_REASON_LABELS } from './const';
import type { ReadDiagnostics, UploadDiagnostics, UploadSkipReason } from './types';
import type {
  HealthConnectReadStage,
  HealthPermissionsResult,
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

export function getRoutePointCount(workouts: WatchWorkout[]): number {
  return workouts.reduce((total, workout) => total + workout.locations.length, 0);
}

export function formatConnectionDiagnostics(
  platform: string,
  availability: string | null,
  isConnected: boolean,
  hasRunichAccount: boolean,
  isRussian: boolean,
): string {
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;
  return `${copy.platform}: ${platform} · ${copy.store}: ${availability ?? copy.checking} · ${copy.connected}: ${getBooleanLabel(isConnected, isRussian)} · ${copy.account}: ${getBooleanLabel(hasRunichAccount, isRussian)}`;
}

export function formatHealthPermissionsDiagnostics(
  permissions: HealthPermissionsResult | null,
  isRussian: boolean,
): string {
  const template = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics.permissionsDetails;
  return template
    .replace('{exerciseSession}', getBooleanLabel(permissions?.details?.exerciseSession, isRussian))
    .replace('{distance}', getBooleanLabel(permissions?.details?.distance, isRussian))
    .replace('{steps}', getBooleanLabel(permissions?.details?.steps, isRussian));
}

export function formatReadDiagnostics(diagnostics: ReadDiagnostics | null, isRussian: boolean): string {
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;
  if (!diagnostics) return copy.noRead;

  const dateLocale = isRussian ? 'ru-RU' : 'en-US';
  const details = [
    `${copy.lastRead}: ${new Date(diagnostics.at).toLocaleString(dateLocale)}`,
    `${copy.range} ${diagnostics.startDate.slice(0, 10)} — ${diagnostics.endDate.slice(0, 10)}`,
    `${copy.status}: ${diagnostics.outcome}`,
    `${copy.stage}: ${diagnostics.stage ? getReadStageLabel(diagnostics.stage, isRussian) : copy.unknownStage}`,
  ];
  if (diagnostics.sessionCount !== undefined) details.push(`${copy.found}: ${diagnostics.sessionCount}`);
  if (diagnostics.processedSessionCount !== undefined) {
    const total = diagnostics.sessionCount === undefined ? '' : `/${diagnostics.sessionCount}`;
    details.push(`${copy.processed}: ${diagnostics.processedSessionCount}${total}`);
  }
  if (diagnostics.errorCode) details.push(`${copy.error} ${diagnostics.errorCode}`);
  return details.join(' · ');
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

export function formatUploadDiagnostics(diagnostics: UploadDiagnostics | null, isRussian: boolean): string {
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;
  if (!diagnostics) return copy.noUpload;

  const dateLocale = isRussian ? 'ru-RU' : 'en-US';
  const details = [`${copy.uploadStatus}: ${new Date(diagnostics.at).toLocaleString(dateLocale)}`, diagnostics.outcome];
  if (diagnostics.skipReason)
    details.push(`${copy.reason}: ${getUploadSkipReasonLabel(diagnostics.skipReason, isRussian)}`);
  details.push(`${copy.workouts} ${diagnostics.workoutCount}`);
  if (!diagnostics.skipReason) {
    details.push(`${copy.gpsPoints} ${diagnostics.sourceRoutePointCount} → ${diagnostics.payloadRoutePointCount}`);
  }
  if (diagnostics.imported !== undefined) {
    details.push(`${copy.imported} ${diagnostics.imported}, ${copy.skipped} ${diagnostics.skipped}`);
  }
  if (diagnostics.errorStatus) details.push(`${copy.responseError} ${diagnostics.errorStatus}`);
  return details.join(' · ');
}

export function formatImportSelectedLabel(count: number, isRussian: boolean): string {
  return WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].importSelected.replace('{count}', String(count));
}
