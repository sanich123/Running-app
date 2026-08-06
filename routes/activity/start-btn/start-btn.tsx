import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, TouchableRipple, useTheme, Text } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import { resetAdditionaInfoActivitySlice } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { saveFinishedActivity } from '@R/slices/activity/activity';
import { setActivityStatus } from '@R/slices/location/location';
import { resetManualActivitySlice } from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';
import { ACTIVITY_START_BTN_TEST_ID, RESPONSE_STATUS, ACTIVITY_START_BTN, STOP_ICON } from './const ';

export default function StartBtn({ isReadyToRecordLocation }: { isReadyToRecordLocation: boolean }) {
  const dispatch = useAppDispatch();
  const { dark, colors } = useTheme();
  const {
    activityStatus,
    duration,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();
  const [pressScale] = useState(() => new Animated.Value(1));
  const [pulse] = useState(() => new Animated.Value(0));
  const isRecording = activityStatus === STATUSES.started || activityStatus === STATUSES.continued;
  const isFinishing = activityStatus === STATUSES.paused;

  useEffect(() => {
    if (!isRecording) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [isRecording, pulse]);

  const responseIcon = {
    [STATUSES.initial]: ACTIVITY_START_BTN[language].start,
    [STATUSES.started]: <Icon testID={STOP_ICON} source="pause" size={42} color={colors.onPrimary} />,
    [STATUSES.paused]: <Icon testID={STOP_ICON} source="stop" size={42} color={colors.onError} />,
    [STATUSES.continued]: <Icon testID={STOP_ICON} source="pause" size={42} color={colors.onPrimary} />,
  };
  const isDisabled = !isReadyToRecordLocation && activityStatus === STATUSES.initial;

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={styles.touchable}
      testID={ACTIVITY_START_BTN_TEST_ID}
      onPressIn={() =>
        Animated.spring(pressScale, { toValue: 0.94, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
      }
      onPressOut={() =>
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
      }
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
          dispatch(resetManualActivitySlice());
          dispatch(resetAdditionaInfoActivitySlice());
          push('/(protected)/manual-activity');
        }
      }}
      disabled={isDisabled}>
      <Animated.View style={[styles.buttonScale, { transform: [{ scale: pressScale }] }]}>
        {isRecording && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                borderColor: colors.primary,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.28] }) }],
              },
            ]}
          />
        )}
        <View
          style={[
            styles.startBtn,
            {
              backgroundColor: isDisabled ? colors.surfaceVariant : isFinishing ? colors.error : colors.primary,
              borderColor: isDisabled ? colors.outline : 'transparent',
              borderWidth: isDisabled ? 1 : 0,
              elevation: isDisabled ? 0 : 5,
            },
          ]}>
          {activityStatus === STATUSES.initial ? (
            <>
              <Icon
                source={isDisabled ? 'lock-outline' : 'play'}
                size={34}
                color={isDisabled ? colors.onSurfaceDisabled : colors.onPrimary}
              />
              <Text style={[styles.startBtnText, { color: isDisabled ? colors.onSurfaceDisabled : colors.onPrimary }]}>
                {responseIcon[activityStatus]}
              </Text>
            </>
          ) : (
            responseIcon[activityStatus]
          )}
        </View>
      </Animated.View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 72,
  },
  buttonScale: {
    height: 116,
    width: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    height: 116,
    width: 116,
    borderRadius: 58,
    borderWidth: 3,
  },
  startBtn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 104,
    width: 104,
    borderRadius: 52,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  startBtnText: {
    textTransform: 'uppercase',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: -2,
  },
});
