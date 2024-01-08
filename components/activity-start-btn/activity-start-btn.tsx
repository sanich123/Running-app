import { saveFinishedActivity, setIsManualAdding } from '@R/activity/activity';
import { setActivityStatus } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location-utils';
import { LANGUAGES, ROUTES, STATUSES } from '@const/enums';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ACTIVITY_START_BTN_TEST_ID, RESPONSE_STATUS, ACTIVITY_START_BTN, STOP_ICON, ResponseIcon } from './const ';

export default function ActivityStartBtn() {
  const dispatch = useAppDispatch();
  const {
    activityStatus,
    duration,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();
  const isRussianText = language === LANGUAGES.russian && activityStatus === STATUSES.paused;

  const RESPONSE_ICON: ResponseIcon = {
    [STATUSES.initial]: ACTIVITY_START_BTN[language].start,
    [STATUSES.started]: <FontAwesome testID={STOP_ICON} name="stop" size={25} style={{ marginRight: 15 }} />,
    [STATUSES.paused]: ACTIVITY_START_BTN[language].finish,
    [STATUSES.continued]: <FontAwesome testID={STOP_ICON} name="stop" size={25} style={{ marginRight: 15 }} />,
  };
  return (
    <Pressable
      style={styles.startBtn}
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
        dispatch(setActivityStatus(RESPONSE_STATUS[activityStatus]));
        if (activityStatus === STATUSES.paused) {
          dispatch(setIsManualAdding(false));
          push(`/${ROUTES.saveActivity}/`);
        }
      }}>
      <Text style={[styles.textStyle, isRussianText && { fontSize: 18 }]}>{RESPONSE_ICON[activityStatus]}</Text>
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
