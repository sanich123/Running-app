import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';
import { errorToast } from '@C/shared/error-toast/error-toast';
import { useAddActivityByUserIdMutation, useUpdateActivityInfoMutation } from '@R/services/activity/activity';
import { resetAdditionaInfoActivitySlice } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { resetLocationsFromBackground } from '@R/slices/location/location';
import { saveUnsendedActivity, setIsHaveUnsyncedActivity } from '@R/slices/unsended-activity/unsended-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getMapBoxImage, getSpeedInMinsInKm } from '@U/location/location-utils';
import { getMillisecondsFromHoursMinutes } from '@U/time-formatter';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';
import type { ActivityToSend } from '@R/services/activity/types';

export default function SaveBtn() {
  const dispatch = useAppDispatch();
  const { colors, dark } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { back, replace } = useRouter();
  const { activityId, isDisabledWhileSending, finishedActivity } = useAppSelector(({ activity }) => activity);
  const { manualDate, manualHours, manualMinutes, manualDistance, isManualAdding, isEditingActivity } = useAppSelector(
    ({ manualActivity }) => manualActivity,
  );
  const additionalInfoActivity = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);
  const { language } = useAppSelector(({ language }) => language);
  const [sendActivity] = useAddActivityByUserIdMutation();
  const [updateActivity] = useUpdateActivityInfoMutation();
  const [activityToSend, setActivityToSend] = useState<ActivityToSend>();
  const textOnBtn = isEditingActivity ? ACTIVITY_SAVE_BTN[language].update : ACTIVITY_SAVE_BTN[language].save;

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={styles.layout}
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      onPress={async () => {
        try {
          if (userId) {
            dispatch(setIsDisableWhileSending(true));
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
            if (!isEditingActivity || !isManualAdding) {
              setActivityToSend(savedActivity);
            }

            if (isEditingActivity) {
              await updateActivity(savedActivity)
                .unwrap()
                .then(() => back())
                .catch((error) => errorToast(error))
                .finally(() => {
                  dispatch(setIsDisableWhileSending(false));
                  dispatch(resetAdditionaInfoActivitySlice());
                  dispatch(resetLocationsFromBackground());
                });
            } else {
              await sendActivity(savedActivity)
                .unwrap()
                .then(() => (isManualAdding ? back() : replace('/')))
                .catch((error) => {
                  if (!isManualAdding) {
                    dispatch(saveUnsendedActivity(activityToSend));
                    dispatch(setIsHaveUnsyncedActivity(true));
                  }
                  errorToast(error);
                })
                .finally(() => {
                  dispatch(setIsDisableWhileSending(false));
                  dispatch(resetAdditionaInfoActivitySlice());
                  dispatch(resetLocationsFromBackground());
                });
            }
          }
        } catch (error) {
          errorToast('', error);
        }
      }}
      disabled={isDisabledWhileSending}>
      <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
        {textOnBtn}
      </Text>
    </TouchableRipple>
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
