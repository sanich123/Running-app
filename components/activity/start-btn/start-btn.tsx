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
import { Href, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, TouchableRipple, useTheme, Text } from 'react-native-paper';

import { ACTIVITY_START_BTN_TEST_ID, RESPONSE_STATUS, ACTIVITY_START_BTN, STOP_ICON, ResponseIcon } from './const ';

export default function StartBtn({ isReadyToRecordLocation }: { isReadyToRecordLocation: boolean }) {
  const dispatch = useAppDispatch();
  const { dark } = useTheme();
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
    [STATUSES.started]: <Icon testID={STOP_ICON} source="pause" size={50} color="white" />,
    [STATUSES.paused]: <Icon testID={STOP_ICON} source="stop" size={50} color="white" />,
    [STATUSES.continued]: <Icon testID={STOP_ICON} source="pause" size={50} color="white" />,
  };

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ borderRadius: 50, opacity: isReadyToRecordLocation ? 1 : 0.5 }}
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
          push(`/${ROUTES.home}/${ROUTES.manualActivity}/` as Href);
        }
      }}
      disabled={!isReadyToRecordLocation}>
      <View style={styles.startBtn}>
        <Text style={styles.startBtnText}>{RESPONSE_ICON[activityStatus]}</Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 90,
    width: 90,
    backgroundColor: 'tomato',
  },
  startBtnText: {
    textTransform: 'uppercase',
    color: 'white',
    fontSize: 25,
  },
});
