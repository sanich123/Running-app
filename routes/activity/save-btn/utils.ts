import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { readLocationJournal } from '@U/location/location-journal';
import { getReducedLocations } from '@U/location/location-utils';
import { getDeviceTimeZone } from '@U/time-zone';
import type { ActivityDetails } from './types';
import type { ActivityToSend } from '@R/services/activity/types';
import type { FinishedActivityDraft } from '@R/slices/activity/types';

export function isServerUnavailableError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const { status, originalStatus } = error as { status?: unknown; originalStatus?: unknown };

  return (
    status === 'FETCH_ERROR' ||
    status === 'TIMEOUT_ERROR' ||
    status === 502 ||
    status === 503 ||
    (status === 'PARSING_ERROR' && (originalStatus === 502 || originalStatus === 503))
  );
}

export function createTrackedActivityBody(
  finishedActivity: FinishedActivityDraft,
  activityDetails: ActivityDetails,
): ActivityToSend['body'] {
  const { routeJournalId, ...finishedActivityMetrics } = finishedActivity;
  const routeLocations = routeJournalId ? (readLocationJournal(routeJournalId)?.locations ?? []) : [];
  const locations = getReducedLocations(routeLocations, MAX_SAVED_ROUTE_LOCATIONS);

  if (!locations.length) {
    throw new Error('Маршрут тренировки не найден');
  }

  return {
    ...finishedActivityMetrics,
    locations,
    duration: Math.round(finishedActivity.duration),
    timeZone: finishedActivity.timeZone ?? getDeviceTimeZone(),
    ...activityDetails,
  };
}
