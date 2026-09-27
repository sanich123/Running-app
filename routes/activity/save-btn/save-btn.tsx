import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Text, Button } from 'react-native-paper';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from '@const/activity-save-btn';
import { ROUTES } from '@const/enums';
import { useAddActivityByUserIdMutation, useUpdateActivityInfoMutation } from '@R/services/activity/activity';
import { useUpdateSessionLocationMutation } from '@R/services/authentication/authentication';
import { queueUnsyncedActivity, resetActivityDraft, setSavingDisabled } from '@R/slices/activity/activity';
import { resetLocationsFromBackground } from '@R/slices/location/location';
import { clearTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useGlobalManualActivityParams } from '@Routes/save-activity-page/manual-activity-params';
import { errorToast } from '@S/error-toast/error-toast';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { deactivateLocationJournal, readLocationJournal, removeLocationJournal } from '@U/location/location-journal';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';
import { getMillisecondsFromHoursMinutesSeconds } from '@U/time-formatter';
import { getDeviceTimeZone } from '@U/time-zone';
import type { ActivityToSend, ActivityUpdateRequest } from '@R/services/activity/types';
import type { FinishedActivityDraft } from '@R/slices/activity/types';

type ActivityDetails = Pick<
  ActivityToSend['body'],
  'title' | 'description' | 'sport' | 'emotion' | 'visibility' | 'media'
>;

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

function createTrackedActivityBody(
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

export default function SaveBtn() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { back, replace } = useRouter();
  const { isSavingDisabled, finishedActivity, media } = useAppSelector(({ activity }) => activity);
  const {
    activityId,
    isManualAdding,
    isEditingActivity,
    manualDate,
    manualDistance,
    title,
    description,
    sport,
    emotion,
    visibility,
    manualHours,
    manualMinutes,
    manualSeconds,
  } = useGlobalManualActivityParams();
  const { language } = useAppSelector(({ settings }) => settings);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdateActivityInfoMutation();
  const [updateSessionLocation] = useUpdateSessionLocationMutation();
  const isSaving = isLoading || isUpdating;
  const textOnBtn = isEditingActivity ? ACTIVITY_SAVE_BTN[language].update : ACTIVITY_SAVE_BTN[language].save;

  return (
    <Button
      style={styles.layout}
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      loading={isSaving}
      onPress={async () => {
        try {
          if (userId) {
            const activityOwnerId = isEditingActivity ? activityId : userId;
            if (!activityOwnerId) {
              errorToast('Не удалось определить активность');
              return;
            }
            const distance = Number(manualDistance) || 0;
            const hours = Number(manualHours) || 0;
            const minutes = Number(manualMinutes) || 0;
            const seconds = Number(manualSeconds) || 0;
            const duration = getMillisecondsFromHoursMinutesSeconds(hours, minutes, seconds);

            if ((isManualAdding || isEditingActivity) && distance <= 0 && duration <= 0) {
              return errorToast(ACTIVITY_SAVE_BTN[language].noDistanceAndTime);
            }
            const editableActivityDetails = {
              title,
              description,
              sport,
              emotion,
              visibility,
            };
            const activityDetails = { ...editableActivityDetails, media };
            const timeZone = getDeviceTimeZone();
            dispatch(setSavingDisabled(true));
            if (isEditingActivity) {
              const savedActivity: ActivityUpdateRequest = {
                body: {
                  ...editableActivityDetails,
                  date: new Date(manualDate).toISOString(),
                  distance: distance * 1000,
                  duration: Math.round(duration),
                  speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
                },
                id: activityOwnerId,
              };
              await updateActivity(savedActivity)
                .unwrap()
                .then(() => back())
                .catch((error) => errorToast('', error))
                .finally(() => {
                  dispatch(resetActivityDraft());
                  dispatch(resetLocationsFromBackground());
                });
            } else {
              const savedActivity: ActivityToSend = {
                body: isManualAdding
                  ? {
                      ...editableActivityDetails,
                      media,
                      timeZone,
                      date: new Date(manualDate).toISOString(),
                      distance: distance * 1000,
                      duration: Math.round(duration),
                      speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
                      locations: [],
                    }
                  : createTrackedActivityBody(finishedActivity, activityDetails),
                id: activityOwnerId,
              };
              const lastLocation = savedActivity.body.locations.at(-1);
              if (lastLocation) {
                void updateSessionLocation({
                  latitude: lastLocation.coords.latitude,
                  longitude: lastLocation.coords.longitude,
                });
              }
              if (!savedActivity.body.speed || !savedActivity.body.duration) {
                return errorToast('Тренировка не имеет скорости или продолжительности');
              }
              await sendActivity(savedActivity)
                .unwrap()
                .then(() => {
                  if (!isManualAdding && finishedActivity.routeJournalId) {
                    removeLocationJournal(finishedActivity.routeJournalId);
                    dispatch(clearTrackingRecovery());
                  }
                  return isManualAdding ? back() : replace(ROUTES.root);
                })
                .catch((error) => {
                  if (!isEditingActivity && isServerUnavailableError(error)) {
                    const { locations: _locations, ...pendingBody } = savedActivity.body;
                    void _locations;
                    dispatch(
                      queueUnsyncedActivity({
                        id: savedActivity.id,
                        routeJournalId: isManualAdding ? null : finishedActivity.routeJournalId,
                        body: pendingBody,
                      }),
                    );
                    if (finishedActivity.routeJournalId) {
                      deactivateLocationJournal(finishedActivity.routeJournalId);
                      dispatch(clearTrackingRecovery());
                    }
                    replace(ROUTES.root);
                    return;
                  }
                  errorToast('', error);
                })
                .finally(() => {
                  dispatch(resetActivityDraft());
                  dispatch(resetLocationsFromBackground());
                });
            }
          }
        } catch (error) {
          errorToast('', error);
        } finally {
          dispatch(setSavingDisabled(false));
        }
      }}
      disabled={isSavingDisabled}>
      {!isSaving && (
        <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
          {textOnBtn}
        </Text>
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
  },
});
