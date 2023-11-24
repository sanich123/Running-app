import { saveFinishedActivity, setIsManualAdding } from '@R/activity/activity';
import { setActivityStatus } from '@R/location/location';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location-utils';
import { LANGUAGES, STATUSES } from '@const/enums';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_START_BTN, STOP_ICON, ACTIVITY_START_BTN_TEST_ID, RESPONSE_STATUS } from './const ';

export default function ActivityStartBtn() {
  const {
    activityStatus,
    duration,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useSelector(({ location }) => location);
  const { language } = useSelector(({ language }) => language);
  const isRussianText = language === LANGUAGES.russian && activityStatus === STATUSES.paused;
  const dispatch = useDispatch();
  const { startBtn, textStyle } = styles;
  const { push } = useRouter();

  const RESPONSE_ICON: { [key in STATUSES]: string | ReactNode } = {
    [STATUSES.initial]: ACTIVITY_START_BTN[language as keyof typeof ACTIVITY_START_BTN].start,
    [STATUSES.started]: <FontAwesome testID={STOP_ICON} name="stop" size={25} style={{ marginRight: 15 }} />,
    [STATUSES.paused]: ACTIVITY_START_BTN[language as keyof typeof ACTIVITY_START_BTN].finish,
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
            locations: getReducedLocations(locations),
            kilometresSplit,
            speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
          }),
        );
        dispatch(setActivityStatus(RESPONSE_STATUS[activityStatus as keyof typeof RESPONSE_STATUS]));
        if (activityStatus === STATUSES.paused) {
          dispatch(setIsManualAdding(false));
          push('/(tabs)/save-activity/');
        }
      }}>
      <Text style={[textStyle, isRussianText && { fontSize: 18 }]}>
        {RESPONSE_ICON[activityStatus as keyof typeof RESPONSE_STATUS]}
      </Text>
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
