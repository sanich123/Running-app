import type { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { queueUnsyncedActivity, removePendingRawRouteUpload, resetActivityDraft } from '@R/slices/activity/activity';
import { resetLocationsFromBackground, setNavigationTrackId } from '@R/slices/location/location';
import { clearTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { errorToast } from '@S/error-toast/error-toast';
import { uploadRawRouteAndQueueOnFailure } from '@U/activity-track/upload-raw-route';
import { getSpeedInMinsInKm } from '@U/location/activity-metrics';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { getReducedLocations } from '@U/location/location-geometry';
import { deactivateLocationJournal, readLocationJournal, removeLocationJournal } from '@U/location/location-journal';
import { getDeviceTimeZone } from '@U/time-zone';
import { ACTIVITY_SAVE_ERROR_COPY } from './const';
import type { ActivityDetails } from './types';
import type {
  useAddActivityByUserIdMutation,
  useUpdateActivityInfoMutation,
  useUploadRawActivityLocationsMutation,
} from '@R/services/activity/activity';
import type { ActivityToSend, ActivityUpdateRequest } from '@R/services/activity/types';
import type { useUpdateSessionLocationMutation } from '@R/services/authentication/authentication';
import type { ActivityPhoto, FinishedActivityDraft } from '@R/slices/activity/types';
import type { useAppDispatch } from '@R/typed-hooks';
import type { useGlobalManualActivityParams } from '@Routes/save-activity-page/manual-activity-params';

interface SaveActivityActionsDependencies {
  dispatch: ReturnType<typeof useAppDispatch>;
  router: ReturnType<typeof useRouter>;
  sendActivity: ReturnType<typeof useAddActivityByUserIdMutation>[0];
  updateActivity: ReturnType<typeof useUpdateActivityInfoMutation>[0];
  uploadRawLocations: ReturnType<typeof useUploadRawActivityLocationsMutation>[0];
  updateSessionLocation: ReturnType<typeof useUpdateSessionLocationMutation>[0];
  finishedActivity: FinishedActivityDraft;
  media: ActivityPhoto[];
  params: ReturnType<typeof useGlobalManualActivityParams>;
}

export function createActivityMedia(media: ActivityPhoto[]): ActivityDetails['media'] {
  return media.map(({ url, thumbnail, blurhash, assetId, thumbnailAssetId }) => ({
    ...(url && !assetId ? { url } : {}),
    thumbnail: thumbnail ?? null,
    ...(blurhash ? { blurhash } : {}),
    ...(assetId ? { assetId } : {}),
    ...(thumbnailAssetId ? { thumbnailAssetId } : {}),
  }));
}

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

export function createActivitySaveActions({
  dispatch,
  router,
  sendActivity,
  updateActivity,
  uploadRawLocations,
  updateSessionLocation,
  finishedActivity,
  media,
  params,
}: SaveActivityActionsDependencies) {
  const { back, dismissTo, replace } = router;
  const { manualDate, title, description, sport, emotion, visibility, hideMap } = params;

  const resetAfterSave = () => {
    dispatch(setNavigationTrackId(null));
    dispatch(resetActivityDraft());
    dispatch(resetLocationsFromBackground());
  };

  const clearTrackedRoute = (routeJournalId: string | null) => {
    if (!routeJournalId) return;
    deactivateLocationJournal(routeJournalId);
    dispatch(clearTrackingRecovery());
  };

  const updateSessionLocationFromActivity = (locations: ActivityToSend['body']['locations']) => {
    const lastLocation = locations.at(-1);
    if (!lastLocation) return;
    void updateSessionLocation({
      latitude: lastLocation.coords.latitude,
      longitude: lastLocation.coords.longitude,
    });
  };

  const scheduleRawRouteUpload = (activityId: string, routeJournalId: string, body: ActivityToSend['body']) => {
    setTimeout(() => {
      const rawLocations = readLocationJournal(routeJournalId)?.locations ?? [];
      if (!rawLocations.length) {
        dispatch(removePendingRawRouteUpload(activityId));
        removeLocationJournal(routeJournalId);
        return;
      }

      void uploadRawRouteAndQueueOnFailure({
        pendingUpload: {
          activityId,
          routeJournalId,
          title: body.title,
          date: body.date ?? new Date().toISOString(),
          sport: body.sport,
        },
        locations: rawLocations,
        dispatch,
        uploadRawLocations,
      }).catch(() => undefined);
    }, 0);
  };

  const submitNewActivity = async (savedActivity: ActivityToSend, routeJournalId: string | null) => {
    const { body } = savedActivity;
    if (!body.speed || !body.duration) {
      return errorToast(ACTIVITY_SAVE_ERROR_COPY.missingSpeedOrDuration);
    }

    try {
      const createdActivity = await sendActivity(savedActivity).unwrap();
      dismissTo(ROUTES.root);
      clearTrackedRoute(routeJournalId);
      updateSessionLocationFromActivity(body.locations);
      if (routeJournalId) {
        scheduleRawRouteUpload(createdActivity.id, routeJournalId, body);
      }
    } catch (error) {
      if (isServerUnavailableError(error)) {
        const { locations: _locations, ...pendingBody } = body;
        void _locations;
        dispatch(queueUnsyncedActivity({ id: savedActivity.id, routeJournalId, body: pendingBody }));
        clearTrackedRoute(routeJournalId);
        replace(ROUTES.root);
        return;
      }
      errorToast('', error);
    } finally {
      resetAfterSave();
    }
  };

  const saveEditedActivity = async (ownerId: string, distance: number, duration: number) => {
    const savedActivity: ActivityUpdateRequest = {
      body: {
        title,
        description,
        sport,
        emotion,
        visibility,
        hideMap,
        date: new Date(manualDate).toISOString(),
        distance: distance * 1000,
        duration: Math.round(duration),
        speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
      },
      id: ownerId,
    };

    try {
      await updateActivity(savedActivity).unwrap();
      back();
    } catch (error) {
      errorToast('', error);
    } finally {
      resetAfterSave();
    }
  };

  const saveManualActivity = (ownerId: string, distance: number, duration: number) =>
    submitNewActivity(
      {
        id: ownerId,
        body: {
          title,
          description,
          sport,
          emotion,
          visibility,
          hideMap,
          media: createActivityMedia(media),
          timeZone: getDeviceTimeZone(),
          date: new Date(manualDate).toISOString(),
          distance: distance * 1000,
          duration: Math.round(duration),
          speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
          locations: [],
        },
      },
      null,
    );

  const saveTrackedActivity = (ownerId: string) => {
    const body = createTrackedActivityBody(finishedActivity, {
      title,
      description,
      sport,
      emotion,
      visibility,
      hideMap,
      media: createActivityMedia(media),
    });
    return submitNewActivity({ id: ownerId, body }, finishedActivity.routeJournalId);
  };

  return { saveEditedActivity, saveManualActivity, saveTrackedActivity };
}
