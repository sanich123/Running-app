import { useAuth } from '@A/context/auth-context';
import {
  setIsDisableWhileSending,
  resetActivityInfo,
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
} from '@R/activity/activity';
import { ActivityToSend } from '@R/activity/types';
import { resetLocationsFromBackground } from '@R/location/location';
import { useAddActivityByUserIdMutation, useUpdateActivityInfoMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { getMapBoxImage, getSpeedInMinsInKm } from '@U/location-utils';
import { getMillisecondsFromHoursMinutes } from '@U/time-formatter';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';

export default function ActivitySaveBtn() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { replace } = useRouter();
  const {
    additionalInfo,
    isDisabledWhileSending,
    isManualAdding,
    isEditingActivity,
    manualDate,
    manualHours,
    manualMinutes,
    manualDistance,
    finishedActivity,
  } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const [sendActivity, { error, data, isSuccess, isError }] = useAddActivityByUserIdMutation();
  const [
    updateActivity,
    { error: errorUpdating, data: successUpdating, isSuccess: isSuccessUpdating, isError: isErrorUpdating },
  ] = useUpdateActivityInfoMutation();
  const [activityToSend, setActivityToSend] = useState<ActivityToSend>();
  const textOnBtn = isEditingActivity ? ACTIVITY_SAVE_BTN[language].update : ACTIVITY_SAVE_BTN[language].save;
  const textOnBtnWhenIsSending = isEditingActivity
    ? ACTIVITY_SAVE_BTN[language].updating
    : ACTIVITY_SAVE_BTN[language].saving;
  const { activityId } = useLocalSearchParams();

  useEffect(() => {
    dispatch(setIsDisableWhileSending(false));
    if (isSuccess || isSuccessUpdating) {
      if (!process.env.IS_TESTING) {
        console.log('success', data || successUpdating);
      }
      if (data?.message) {
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(data?.message, ToastDuration.long);
        }
      }
      dispatch(resetActivityInfo());
      dispatch(resetLocationsFromBackground());
      replace(`/`);
    }
    if ((isError && error) || (isErrorUpdating && errorUpdating)) {
      dispatch(saveUnsendedActivity(activityToSend));
      dispatch(setIsHaveUnsyncedActivity(true));
      console.log('error', error, activityToSend);
      if (Platform.OS !== 'web') {
        showCrossPlatformToast(ACTIVITY_SAVE_BTN[language].errorMsg, ToastDuration.long);
      }
      if (error && 'status' in error) {
        if (error.status === 'FETCH_ERROR') {
          dispatch(resetActivityInfo());
          dispatch(resetLocationsFromBackground());
          replace(`/`);
        }
      }
    }
  }, [data, error, successUpdating, isErrorUpdating]);

  return (
    <Pressable
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      onPress={async () => {
        if (user) {
          dispatch(setIsDisableWhileSending(true));
          const savedActivity = {
            body:
              isManualAdding || isEditingActivity
                ? {
                    ...additionalInfo,
                    date: manualDate || new Date(),
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
                    ...{
                      ...additionalInfo,
                      mapPhotoUrl: `${getMapBoxImage(finishedActivity.locations)}`,
                    },
                  },
            id: isEditingActivity ? `${activityId}` : user.id,
          };
          setActivityToSend(savedActivity);
          if (isEditingActivity) {
            await updateActivity(savedActivity).unwrap();
          } else {
            await sendActivity(savedActivity).unwrap();
          }
        }
      }}
      disabled={isDisabledWhileSending}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Text
        variant="titleMedium"
        style={{ color: colors.onSurfaceVariant, marginRight: 15, opacity: isDisabledWhileSending ? 0.5 : 1 }}>
        {isDisabledWhileSending ? textOnBtnWhenIsSending : textOnBtn}
      </Text>
    </Pressable>
  );
}
