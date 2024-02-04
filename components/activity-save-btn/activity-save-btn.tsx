import { useAuth } from '@A/context/auth-context';
import {
  setIsDisableWhileSending,
  resetActivityInfo,
  setIsNeedToResetInputs,
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
} from '@R/activity/activity';
import { ActivityToSend } from '@R/activity/types';
import { resetLocationsFromBackground } from '@R/location/location';
import { useAddActivityByUserIdMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { getMapBoxImage, getSpeedInMinsInKm } from '@U/location-utils';
import { getMillisecondsFromHoursMinutes } from '@U/time-formatter';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
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
    manualDate,
    manualHours,
    manualMinutes,
    manualDistance,
    finishedActivity,
  } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const [sendActivity, { error, data, isSuccess, isError }] = useAddActivityByUserIdMutation();
  const [activityToSend, setActivityToSend] = useState<ActivityToSend>();

  useEffect(() => {
    dispatch(setIsDisableWhileSending(false));
    if (isSuccess) {
      if (!process.env.IS_TESTING) {
        console.log('success', data);
      }
      if (data?.message) {
        showCrossPlatformToast(data?.message, ToastDuration.long);
      }
      dispatch(resetActivityInfo());
      dispatch(setIsNeedToResetInputs(true));
      dispatch(resetLocationsFromBackground());
      replace(`/`);
    }
    if (isError && error) {
      dispatch(saveUnsendedActivity(activityToSend));
      dispatch(setIsHaveUnsyncedActivity(true));
      console.log('error', error, activityToSend);
      showCrossPlatformToast(ACTIVITY_SAVE_BTN[language].errorMsg, ToastDuration.long);
      if ('status' in error) {
        if (error.status === 'FETCH_ERROR') {
          dispatch(resetActivityInfo());
          dispatch(setIsNeedToResetInputs(true));
          dispatch(resetLocationsFromBackground());
          replace(`/`);
        }
      }
    }
  }, [data, error]);

  return (
    <Pressable
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      onPress={async () => {
        if (user) {
          dispatch(setIsDisableWhileSending(true));
          const savedActivity = {
            body: isManualAdding
              ? {
                  ...additionalInfo,
                  date: manualDate || new Date(),
                  distance: manualDistance * 1000,
                  duration: getMillisecondsFromHoursMinutes(manualHours, manualMinutes),
                  speed: getSpeedInMinsInKm(manualDistance, getMillisecondsFromHoursMinutes(manualHours, manualMinutes))
                    .paceAsNumber,
                  locations: [],
                }
              : {
                  ...finishedActivity,
                  ...{
                    ...additionalInfo,
                    photoUrls: [`${getMapBoxImage(finishedActivity.locations)}`, ...additionalInfo.photoUrls],
                  },
                },
            id: user.id,
          };
          setActivityToSend(savedActivity);
          await sendActivity(savedActivity).unwrap();
        }
      }}
      disabled={isDisabledWhileSending}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Text
        variant="titleMedium"
        style={{ color: colors.primaryContainer, marginRight: 15, opacity: isDisabledWhileSending ? 0.5 : 1 }}>
        {isDisabledWhileSending ? ACTIVITY_SAVE_BTN[language].saving : ACTIVITY_SAVE_BTN[language].save}
      </Text>
    </Pressable>
  );
}
