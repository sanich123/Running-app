import { useState } from 'react';
import { ActivityIndicator, Animated, View, StyleSheet } from 'react-native';
import { TouchableRipple, useTheme, Icon } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import { setFinishedActivity } from '@R/slices/activity/activity';
import { setActivityStatus, setEmptyLastArrayWhenPaused } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { startLocationTracking, stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';

export default function PauseBtn() {
  const { dark, colors } = useTheme();
  const dispatch = useAppDispatch();
  const {
    activityStatus,
    duration,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useAppSelector(({ location }) => location);
  const [pressScale] = useState(() => new Animated.Value(1));
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);

  const handlePress = async () => {
    if (isTrackingActionInProgress) {
      return;
    }

    setIsTrackingActionInProgress(true);
    try {
      if (activityStatus === STATUSES.paused) {
        await startLocationTracking();
        dispatch(setActivityStatus(STATUSES.continued));
      } else {
        await stopLocationTracking();
        dispatch(
          setFinishedActivity({
            duration,
            distance,
            locations: getReducedLocations(locations),
            kilometresSplit,
            speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
          }),
        );
        dispatch(setActivityStatus(STATUSES.paused));
        dispatch(setEmptyLastArrayWhenPaused());
      }
    } catch (error) {
      errorToast(
        activityStatus === STATUSES.paused
          ? 'Не удалось запустить отслеживание геопозиции'
          : 'Не удалось остановить отслеживание геопозиции',
        error,
      );
    } finally {
      setIsTrackingActionInProgress(false);
    }
  };

  return (
    <TouchableRipple
      testID="activity-pause-toggle"
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={styles.touchable}
      onPressIn={() =>
        Animated.spring(pressScale, { toValue: 0.94, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
      }
      onPressOut={() =>
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
      }
      onPress={handlePress}
      disabled={isTrackingActionInProgress}>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <View style={[styles.pauseBtn, { backgroundColor: colors.primaryContainer }]}>
          {isTrackingActionInProgress ? (
            <ActivityIndicator testID="pause-tracking-action-loading" color={colors.primary} />
          ) : (
            <Icon source="play" size={30} color={colors.primary} />
          )}
        </View>
      </Animated.View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 38,
  },
  pauseBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 72,
    width: 72,
    borderRadius: 36,
  },
});
