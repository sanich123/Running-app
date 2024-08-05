/* eslint-disable react-hooks/exhaustive-deps */
import { useAuth } from '@A/context/auth-context';
import {
  setIsDisableWhileSending,
  resetActivityInfo,
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
} from '@R/activity/activity';
import { ActivityToSend } from '@R/activity/types';
import { resetLocationsFromBackground } from '@R/location/location';
import { setIsNeedToRefreshActivities } from '@R/main-feed/main-feed';
import { useAddActivityByUserIdMutation, useUpdateActivityInfoMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { getMapBoxImage, getSpeedInMinsInKm } from '@U/location/location-utils';
import { getMillisecondsFromHoursMinutes } from '@U/time-formatter';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID, ErrorMessages } from './const';

export default function SaveBtn() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { colors, dark } = useTheme();
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
      if (__DEV__ && !process.env.IS_TESTING) {
        console.log('success', data || successUpdating);
      }
      if (data?.message) {
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(data?.message, ToastDuration.long);
        }
      }
      dispatch(resetActivityInfo());
      dispatch(resetLocationsFromBackground());
      dispatch(setIsNeedToRefreshActivities(true));
      replace(`/`);
    }
  }, [isSuccess, isSuccessUpdating, data, successUpdating]);

  useEffect(() => {
    if ((isError && error) || (isErrorUpdating && errorUpdating)) {
      dispatch(saveUnsendedActivity(activityToSend));
      dispatch(setIsHaveUnsyncedActivity(true));
      if (error && 'message' in error && error?.message === ErrorMessages.aborted) {
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(ACTIVITY_SAVE_BTN[language].errorMsgTimeout);
        } else {
          toast.show(ACTIVITY_SAVE_BTN[language].errorMsgTimeout);
        }
      }
      if (error && 'status' in error) {
        if (error.status === ErrorMessages.fetchError) {
          if (Platform.OS !== 'web') {
            showCrossPlatformToast(ACTIVITY_SAVE_BTN[language].fetchError);
          } else {
            toast.show(ACTIVITY_SAVE_BTN[language].fetchError);
          }
        }
      }
      dispatch(resetActivityInfo());
      dispatch(resetLocationsFromBackground());
      replace('/');
    }
  }, [error, isError, isErrorUpdating, errorUpdating, dispatch, replace, toast, activityToSend, language]);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={styles.layout}
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      onPress={async () => {
        if (user) {
          dispatch(setIsDisableWhileSending(true));
          const savedActivity = {
            body:
              isManualAdding || isEditingActivity
                ? {
                    ...additionalInfo,
                    date: manualDate,
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
      disabled={isDisabledWhileSending}>
      <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
        {isDisabledWhileSending ? textOnBtnWhenIsSending : textOnBtn}
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
