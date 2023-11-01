import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { LANGUAGE } from '../../constants/languages/languages';
import { useAppSelector } from '../../redux/hooks/hooks';
import { saveFinishedActivity, setActivityStatus } from '../../redux/location/location';
import { getSpeedInMinsInKm } from '../../utils/location-utils';

const { initial, started, paused, continued } = STATUSES;

export default function ActivityStartBtn() {
  const {
    activityStatus,
    duration,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useSelector(({ location }) => location);

  const dispatch = useDispatch();
  const { startBtn, textStyle } = styles;
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();

  const responseStatus: { [key in STATUSES]: STATUSES } = {
    [initial]: started,
    [started]: paused,
    [paused]: initial,
    [continued]: paused,
  };

  const responseIcon: { [key in STATUSES]: string | ReactNode } = {
    [initial]: LANGUAGE[language].activity.controlBtns.start,
    [started]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
    [paused]: LANGUAGE[language].activity.controlBtns.finish,
    [continued]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
  };

  return (
    <Pressable
      style={startBtn}
      testID="startButton"
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
        dispatch(setActivityStatus(responseStatus[activityStatus]));
        if (activityStatus === paused) {
          push('/(tabs)/save-activity/');
        }
      }}>
      <Text style={textStyle}>{responseIcon[activityStatus]}</Text>
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
