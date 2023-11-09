import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_START_BTN, ACTIVITY_START_BTN_TEST_ID, RESPONSE_STATUS, STOP_ICON } from './const ';
import { STATUSES } from '../../constants/enums';
import { saveFinishedActivity, setActivityStatus } from '../../redux/location/location';
import { getSpeedInMinsInKm } from '../../utils/location-utils';

export default function ActivityStartBtn() {
  const {
    activityStatus,
    duration,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useSelector(({ location }) => location);
  const { language } = useSelector(({ language }) => language);

  const dispatch = useDispatch();
  const { startBtn, textStyle } = styles;
  const { push } = useRouter();

  const RESPONSE_ICON: { [key in STATUSES]: string | ReactNode } = {
    [STATUSES.initial]: ACTIVITY_START_BTN[language].start,
    [STATUSES.started]: <FontAwesome testID={STOP_ICON} name="stop" size={25} style={{ marginRight: 15 }} />,
    [STATUSES.paused]: ACTIVITY_START_BTN[language].finish,
    [STATUSES.continued]: <FontAwesome testID={STOP_ICON} name="stop" size={25} style={{ marginRight: 15 }} />,
  };

  return (
    <Pressable
      style={startBtn}
      testID={ACTIVITY_START_BTN_TEST_ID}
      onPress={() => {
        dispatch(
          saveFinishedActivity({
            duration,
            distance,
            locations,
            kilometresSplit,
            speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
          }),
        );
        dispatch(setActivityStatus(RESPONSE_STATUS[activityStatus]));
        if (activityStatus === STATUSES.paused) {
          push('/(tabs)/save-activity/');
        }
      }}>
      <Text style={textStyle}>{RESPONSE_ICON[activityStatus]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  startBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    borderRadius: 50,
    width: 90,
    height: 90,
  },
  textStyle: {
    fontSize: 28,
    textTransform: 'uppercase',
    color: 'white',
  },
});
