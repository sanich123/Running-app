import { useAuth } from '@A/context/utils';
import {
  setIsDisableWhileSending,
  resetActivityInfo,
  saveUnsendedActivity,
  setIsHaveUnsyncedActivity,
} from '@R/slices/activity/activity';
import { ActivityToSend } from '@R/services/activity/types';
import { resetLocationsFromBackground } from '@R/slices/location/location';
import { setIsNeedToRefreshActivities } from '@R/slices/main-feed/main-feed';
import { useAddActivityByUserIdMutation, useUpdateActivityInfoMutation } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { getMapBoxImage, getSpeedInMinsInKm } from '@U/location/location-utils';
import { getMillisecondsFromHoursMinutes } from '@U/time-formatter';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID, ErrorMessages } from './const';

export default function SaveBtn() {
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
  const [sendActivity, { data }] = useAddActivityByUserIdMutation();
  const [updateActivity] = useUpdateActivityInfoMutation();
  const [activityToSend, setActivityToSend] = useState<ActivityToSend>();
  const textOnBtn = isEditingActivity ? ACTIVITY_SAVE_BTN[language].update : ACTIVITY_SAVE_BTN[language].save;
  const textOnBtnWhenIsSending = isEditingActivity
    ? ACTIVITY_SAVE_BTN[language].updating
    : ACTIVITY_SAVE_BTN[language].saving;
  const { activityId } = useGlobalSearchParams();

  const onSuccessHandler = () => {
    dispatch(setIsDisableWhileSending(false));
    if (data?.message) {
      showCrossPlatformToast(data?.message);
    }
    dispatch(resetActivityInfo());
    dispatch(resetLocationsFromBackground());
    dispatch(setIsNeedToRefreshActivities(true));
    replace(`/`);
  };

  const onErrorHandler = (error: any) => {
    dispatch(saveUnsendedActivity(activityToSend));
    dispatch(setIsHaveUnsyncedActivity(true));
    if (error && 'message' in error && error?.message === ErrorMessages.aborted) {
      showCrossPlatformToast(ACTIVITY_SAVE_BTN[language].errorMsgTimeout);
    }
    if (error && 'status' in error) {
      if (error.status === ErrorMessages.fetchError) {
        showCrossPlatformToast(ACTIVITY_SAVE_BTN[language].fetchError);
      }
    }
    dispatch(resetActivityInfo());
    dispatch(resetLocationsFromBackground());
    replace('/');
  };

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
                    ...{
                      ...additionalInfo,
                      mapPhotoUrl: `${getMapBoxImage(finishedActivity.locations)}`,
                    },
                  },
            id: isEditingActivity ? `${activityId}` : user.id,
          };
          setActivityToSend(savedActivity);
          if (isEditingActivity) {
            await updateActivity(savedActivity).unwrap().then(onSuccessHandler).catch(onErrorHandler);
          } else {
            await sendActivity(savedActivity).unwrap().then(onSuccessHandler).catch(onErrorHandler);
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
