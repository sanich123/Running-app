import {
  resetActivityInfo,
  resetManualData,
  saveFinishedActivity,
  setIsEditingActivity,
  setIsManualAdding,
} from '@R/activity/activity';
import { setActivityStatus } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';
import { ROUTES, STATUSES } from '@const/enums';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

import { ACTIVITY_START_BTN_TEST_ID, RESPONSE_STATUS, ACTIVITY_START_BTN, STOP_ICON, ResponseIcon } from './const ';

export default function StartBtn() {
  const dispatch = useAppDispatch();
  const { colors, dark } = useTheme();
  const {
    activityStatus,
    duration,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();

  const RESPONSE_ICON: ResponseIcon = {
    [STATUSES.initial]: ACTIVITY_START_BTN[language].start,
    [STATUSES.started]: <FontAwesome testID={STOP_ICON} name="stop" size={25} style={{ marginRight: 15 }} />,
    [STATUSES.paused]: ACTIVITY_START_BTN[language].finish,
    [STATUSES.continued]: <FontAwesome testID={STOP_ICON} name="stop" size={25} style={{ marginRight: 15 }} />,
  };

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ borderRadius: 50 }}
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
          dispatch(setIsEditingActivity(false));
          dispatch(resetManualData());
          dispatch(resetActivityInfo());
          push(`/(tabs)/${ROUTES.home}/${ROUTES.manualActivity}/`);
        }
      }}>
      <View style={[styles.startBtn, { backgroundColor: colors.error }]}>
        <Text style={[styles.startBtnText, { fontSize: activityStatus === STATUSES.initial ? 35 : 15 }]}>
          {RESPONSE_ICON[activityStatus]}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 95,
    width: 95,
  },
  startBtnText: {
    textTransform: 'uppercase',
    color: 'white',
  },
});
