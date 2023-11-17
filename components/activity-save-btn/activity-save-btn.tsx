import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';
import { useAuth } from '../../auth/context/auth-context';
import {
  resetActivityInfo,
  saveUnsendedActivity,
  setIsDisableWhileSending,
  setIsHaveUnsyncedActivity,
  setIsNeedToResetInputs,
} from '../../redux/activity/activity';
import { resetLocationsFromBackground } from '../../redux/location/location';
import { runichApi, useAddActivityByUserIdMutation } from '../../redux/runich-api/runich-api';
import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { getMillisecondsFromHoursMinutes } from '../../utils/time-formatter';

export default function ActivitySaveBtn() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { push } = useRouter();
  const { finishedActivity } = useSelector(({ location }) => location);
  const {
    additionalInfo,
    isDisabledWhileSending,
    isManualAdding,
    manualDate,
    manualHours,
    manualMinutes,
    manualDistance,
  } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);
  const [sendActivity, { error, data }] = useAddActivityByUserIdMutation();
  const dispatch = useDispatch();
  let activityToSend;

  useEffect(() => {
    dispatch(setIsDisableWhileSending(false));
    if (data) {
      console.log(data);
      dispatch(resetActivityInfo());
      dispatch(setIsNeedToResetInputs(true));
      dispatch(resetLocationsFromBackground());
      push('/home/');
    }
    if (error) {
      dispatch(saveUnsendedActivity(activityToSend));
      dispatch(resetActivityInfo());
      dispatch(setIsNeedToResetInputs(true));
      dispatch(resetLocationsFromBackground());
      dispatch(setIsHaveUnsyncedActivity(true));
      dispatch(runichApi.util.resetApiState());
      console.log(error);
      ToastAndroid.show(ACTIVITY_SAVE_BTN[language].errorMsg, ToastAndroid.LONG);
      push('/home/');
    }
  }, [data, error]);

  return (
    <Pressable
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      onPress={async () => {
        dispatch(setIsDisableWhileSending(true));
        if (isManualAdding) {
          activityToSend = {
            body: {
              ...additionalInfo,
              date: manualDate,
              distance: manualDistance * 1000,
              duration: getMillisecondsFromHoursMinutes(manualHours, manualMinutes),
              speed: getSpeedInMinsInKm(manualDistance, getMillisecondsFromHoursMinutes(manualHours, manualMinutes))
                .paceAsNumber,
              locations: [],
            },
            id: user.id,
          };
          await sendActivity(activityToSend);
        } else {
          activityToSend = {
            body: { ...finishedActivity, ...additionalInfo },
            id: user.id,
          };
          await sendActivity(activityToSend).unwrap();
        }
      }}
      disabled={isDisabledWhileSending}>
      <Text
        variant="titleMedium"
        style={{ color: colors.primaryContainer, marginRight: 15, opacity: isDisabledWhileSending ? 0.5 : 1 }}>
        {isDisabledWhileSending ? ACTIVITY_SAVE_BTN[language].saving : ACTIVITY_SAVE_BTN[language].save}
      </Text>
    </Pressable>
  );
}
