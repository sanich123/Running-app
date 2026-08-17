import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Text, Button } from 'react-native-paper';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from '@const/activity-save-btn';
import { ROUTES } from '@const/enums';
import { useAddActivityByUserIdMutation, useUpdateActivityInfoMutation } from '@R/services/activity/activity';
import { useUpdateSessionLocationMutation } from '@R/services/authentication/authentication';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { resetAdditionalInfoActivitySlice } from '@R/slices/activity-additional-info/activity-additional-info';
import { resetLocationsFromBackground } from '@R/slices/location/location';
import { saveUnsendedActivity } from '@R/slices/unsended-activity/unsended-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useGlobalManualActivityParams } from '@Routes/save-activity-page/manual-activity-params';
import { errorToast } from '@S/error-toast/error-toast';
import { getMapBoxImage, getSpeedInMinsInKm } from '@U/location/location-utils';
import { getMillisecondsFromHoursMinutesSeconds } from '@U/time-formatter';

export default function SaveBtn() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { back, replace } = useRouter();
  const { isDisabledWhileSending, finishedActivity } = useAppSelector(({ activity }) => activity);
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
    isPublic,
    manualHours,
    manualMinutes,
    manualSeconds,
  } = useGlobalManualActivityParams();
  const { photoVideoUrls } = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);
  const { language } = useAppSelector(({ language }) => language);
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
            const additionalInfoActivity = {
              title,
              description,
              sport,
              emotion,
              isPublic,
              photoVideoUrls,
            };
            const savedActivity = {
              body:
                isManualAdding || isEditingActivity
                  ? {
                      ...additionalInfoActivity,
                      date: new Date(manualDate).toISOString(),
                      distance: distance * 1000,
                      duration: Math.round(duration),
                      speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
                      locations: [],
                    }
                  : {
                      ...finishedActivity,
                      duration: Math.round(finishedActivity.duration),
                      ...additionalInfoActivity,
                      mapPhotoUrl: `${getMapBoxImage(finishedActivity.locations)}`,
                    },
              id: activityOwnerId,
            };
            const lastLocation = savedActivity.body.locations?.at(-1);
            if (lastLocation) {
              void updateSessionLocation({
                latitude: lastLocation.coords.latitude,
                longitude: lastLocation.coords.longitude,
              });
            }
            dispatch(setIsDisableWhileSending(true));
            if (isEditingActivity) {
              await updateActivity(savedActivity)
                .unwrap()
                .then(() => back())
                .catch((error) => errorToast('', error))
                .finally(() => {
                  dispatch(resetAdditionalInfoActivitySlice());
                  dispatch(resetLocationsFromBackground());
                });
            } else {
              if (!savedActivity?.body?.speed || !savedActivity?.body?.duration) {
                return errorToast('Активность не имеет скорости или продолжительности');
              }
              await sendActivity(savedActivity)
                .unwrap()
                .then(() => (isManualAdding ? back() : replace(ROUTES.root)))
                .catch((error) => {
                  if (!isEditingActivity) {
                    dispatch(saveUnsendedActivity(savedActivity));
                    replace(ROUTES.root);
                  }
                  errorToast('', error);
                })
                .finally(() => {
                  dispatch(resetAdditionalInfoActivitySlice());
                  dispatch(resetLocationsFromBackground());
                });
            }
          }
        } catch (error) {
          errorToast('', error);
        } finally {
          dispatch(setIsDisableWhileSending(false));
        }
      }}
      disabled={isDisabledWhileSending}>
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
