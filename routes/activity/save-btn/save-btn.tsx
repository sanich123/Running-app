import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Text, Button } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAddActivityByUserIdMutation, useUpdateActivityInfoMutation } from '@R/services/activity/activity';
import { resetAdditionaInfoActivitySlice } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { resetLocationsFromBackground } from '@R/slices/location/location';
import { saveUnsendedActivity } from '@R/slices/unsended-activity/unsended-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getMapBoxImage, getSpeedInMinsInKm } from '@U/location/location-utils';
import { getMillisecondsFromHoursMinutes } from '@U/time-formatter';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';

export default function SaveBtn() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { back, replace } = useRouter();
  const { activityId, isDisabledWhileSending, finishedActivity } = useAppSelector(({ activity }) => activity);
  const { manualDate, manualHours, manualMinutes, manualDistance, isManualAdding, isEditingActivity } = useAppSelector(
    ({ manualActivity }) => manualActivity,
  );
  const additionalInfoActivity = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);
  const { language } = useAppSelector(({ language }) => language);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdateActivityInfoMutation();
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
            const savedActivity = {
              body:
                isManualAdding || isEditingActivity
                  ? {
                      ...additionalInfoActivity,
                      date: new Date(manualDate).toISOString(),
                      distance: manualDistance * 1000,
                      duration: getMillisecondsFromHoursMinutes(manualHours, manualMinutes),
                      speed: getSpeedInMinsInKm(
                        manualDistance,
                        getMillisecondsFromHoursMinutes(manualHours, manualMinutes),
                      ).paceAsNumber,
                      locations: [],
                    }
                  : {
                      ...finishedActivity,
                      ...additionalInfoActivity,
                      mapPhotoUrl: `${getMapBoxImage(finishedActivity.locations)}`,
                    },
              id: isEditingActivity ? activityId : userId,
            };
            dispatch(setIsDisableWhileSending(true));
            if (isEditingActivity) {
              await updateActivity(savedActivity)
                .unwrap()
                .then(() => back())
                .catch((error) => errorToast('', error))
                .finally(() => {
                  dispatch(resetAdditionaInfoActivitySlice());
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
                  dispatch(resetAdditionaInfoActivitySlice());
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
    marginRight: 5,
    borderRadius: 10,
  },
});
