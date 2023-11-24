import { useAuth } from '@A/context/auth-context';
import {
  setIsDisableWhileSending,
  resetActivityInfo,
  setIsNeedToResetInputs,
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
} from '@R/activity/activity';
import { resetLocationsFromBackground } from '@R/location/location';
import { useAddActivityByUserIdMutation, runichApi } from '@R/runich-api/runich-api';
import { getSpeedInMinsInKm } from '@U/location-utils';
import { getMillisecondsFromHoursMinutes } from '@U/time-formatter';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';

export default function ActivitySaveBtn() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { push } = useRouter();
  const {
    additionalInfo,
    isDisabledWhileSending,
    isManualAdding,
    manualDate,
    manualHours,
    manualMinutes,
    manualDistance,
    finishedActivity,
  } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);
  const [sendActivity, { error, data, isSuccess, isError }] = useAddActivityByUserIdMutation();
  const dispatch = useDispatch();

  let activityToSend: { body: any; id: string };

  useEffect(() => {
    dispatch(setIsDisableWhileSending(false));
    if (isSuccess) {
      if (!process.env.IS_TESTING) {
        console.log(data);
      }
      if (data?.message) {
        ToastAndroid.show(data?.message, ToastAndroid.LONG);
      }
      dispatch(resetActivityInfo());
      dispatch(setIsNeedToResetInputs(true));
      dispatch(resetLocationsFromBackground());
      push('/home/');
    }
    if (isError) {
      dispatch(resetActivityInfo());
      dispatch(setIsNeedToResetInputs(true));
      dispatch(resetLocationsFromBackground());
      dispatch(saveUnsendedActivity(activityToSend));
      dispatch(setIsHaveUnsyncedActivity(true));
      dispatch(runichApi.util.resetApiState());
      console.log(error);
      ToastAndroid.show(ACTIVITY_SAVE_BTN[language as keyof typeof ACTIVITY_SAVE_BTN].errorMsg, ToastAndroid.LONG);
      push('/home/');
    }
  }, [data, error]);

  return (
    <Pressable
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      onPress={async () => {
        dispatch(setIsDisableWhileSending(true));
        activityToSend = {
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
            : { ...finishedActivity, ...additionalInfo },
          id: user.id,
        };
        await sendActivity(activityToSend).unwrap();
      }}
      disabled={isDisabledWhileSending}>
      <Text
        variant="titleMedium"
        style={{ color: colors.primaryContainer, marginRight: 15, opacity: isDisabledWhileSending ? 0.5 : 1 }}>
        {isDisabledWhileSending
          ? ACTIVITY_SAVE_BTN[language as keyof typeof ACTIVITY_SAVE_BTN].saving
          : ACTIVITY_SAVE_BTN[language as keyof typeof ACTIVITY_SAVE_BTN].save}
      </Text>
    </Pressable>
  );
}
