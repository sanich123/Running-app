import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, TouchableRipple, useTheme, Text } from 'react-native-paper';
import { ROUTES, STATUSES } from '@const/enums';
import { resetFinishedActivity, saveFinishedActivity } from '@R/slices/activity/activity';
import { resetAdditionalInfoActivitySlice } from '@R/slices/activity-additional-info/activity-additional-info';
import {
  resetLocationsFromBackground,
  setActivityStatus,
  setEmptyLastArrayWhenPaused,
} from '@R/slices/location/location';
import { resetManualActivitySlice } from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import useGetCurrentLocation from '@U/hooks/use-get-current-location';
import { startLocationTracking, stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';
import { ACTIVITY_START_BTN_TEST_ID, ACTIVITY_START_BTN, STOP_ICON } from './const';

export default function StartBtn({
  isReadyToRecordLocation,
  isGettingLocation: isGettingLocationProp,
  onTrackingActionInProgressChange,
}: {
  isReadyToRecordLocation: boolean;
  isGettingLocation?: boolean;
  onTrackingActionInProgressChange?: (isInProgress: boolean) => void;
}) {
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
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);
  const { isLoading: isGettingLocationFromHook } = useGetCurrentLocation(
    isGettingLocationProp === undefined && isReadyToRecordLocation,
  );
  const isGettingLocation = isGettingLocationProp ?? isGettingLocationFromHook;
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
    [STATUSES.started]: <Icon testID={STOP_ICON} source="pause" size={42} color={colors.onPrimary} />,
    [STATUSES.paused]: <Icon testID={STOP_ICON} source="stop" size={42} color={colors.onError} />,
    [STATUSES.continued]: <Icon testID={STOP_ICON} source="pause" size={42} color={colors.onPrimary} />,
  };
  const isInitialLocationLoading =
    activityStatus === STATUSES.initial && (isGettingLocation || isTrackingActionInProgress);
  const isDisabled = isTrackingActionInProgress || (activityStatus === STATUSES.initial && !isReadyToRecordLocation);

  const saveCurrentActivity = () => {
    dispatch(
      saveFinishedActivity({
        duration,
        distance,
        locations: getReducedLocations(locations),
        kilometresSplit,
        speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
      }),
    );
  };

  const handlePress = async () => {
    if (isDisabled) {
      return;
    }

    setIsTrackingActionInProgress(true);
    onTrackingActionInProgressChange?.(true);
    try {
      if (activityStatus === STATUSES.initial) {
        // A new recording must never inherit a persisted recording or a
        // location task left alive after an app restart.
        await stopLocationTracking();
        dispatch(resetLocationsFromBackground());
        dispatch(resetFinishedActivity());
        await startLocationTracking();
        dispatch(setActivityStatus(STATUSES.started));
        return;
      }

      await stopLocationTracking();
      saveCurrentActivity();

      if (isRecording) {
        dispatch(setActivityStatus(STATUSES.paused));
        dispatch(setEmptyLastArrayWhenPaused());
        return;
      }

      dispatch(setActivityStatus(STATUSES.initial));
      dispatch(resetLocationsFromBackground());
      dispatch(resetManualActivitySlice());
      dispatch(resetAdditionalInfoActivitySlice());
      push(`/${ROUTES.manualActivity}`);
    } catch (error) {
      errorToast(
        activityStatus === STATUSES.initial
          ? 'Не удалось запустить отслеживание геопозиции'
          : 'Не удалось остановить отслеживание геопозиции',
        error,
      );
    } finally {
      setIsTrackingActionInProgress(false);
      onTrackingActionInProgressChange?.(false);
    }
  };

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
      onPress={handlePress}
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
              {isInitialLocationLoading ? (
                <View style={styles.locationLoadingIcon}>
                  <ActivityIndicator
                    testID="location-loading"
                    color={isDisabled ? colors.onSurfaceDisabled : colors.onPrimary}
                    size="small"
                  />
                </View>
              ) : (
                <Icon
                  source={isDisabled ? 'lock-outline' : 'play'}
                  size={34}
                  color={isDisabled ? colors.onSurfaceDisabled : colors.onPrimary}
                />
              )}
              <Text style={[styles.startBtnText, { color: isDisabled ? colors.onSurfaceDisabled : colors.onPrimary }]}>
                {ACTIVITY_START_BTN[language].start}
              </Text>
            </>
          ) : isTrackingActionInProgress ? (
            <ActivityIndicator testID="tracking-action-loading" color={colors.onPrimary} size="large" />
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
  locationLoadingIcon: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
