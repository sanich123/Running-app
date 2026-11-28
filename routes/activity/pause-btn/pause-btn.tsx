import { useState } from 'react';
import { ActivityIndicator, Animated, View, StyleSheet } from 'react-native';
import { TouchableRipple, useTheme, Icon } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import { setFinishedActivity } from '@R/slices/activity/activity';
import {
  setActivityStatus,
  setDurationAt,
  setEmptyLastArrayWhenPaused,
  startDurationTimer,
  stopDurationTimer,
} from '@R/slices/location/location';
import { setTrackingRecoveryStatus } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppDispatch, useAppShallowSelector } from '@R/typed-hooks';
import { ACTIVITY_TRACKING_ERROR_COPY } from '@Routes/activity/const';
import { errorToast } from '@S/error-toast/error-toast';
import { getCurrentActivityDuration } from '@U/activity-duration';
import { getSpeedInMinsInKm } from '@U/location/activity-metrics';
import { startLocationTracking, stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { getElevationGainByKilometres } from '@U/location/location-geometry';
import {
  getActiveLocationJournalId,
  markLocationJournalPause,
  readLocationJournal,
} from '@U/location/location-journal';
import { pausePedometerActivity, resumePedometerActivity } from '@U/pedometer/pedometer';
import { getDeviceTimeZone } from '@U/time-zone';

export default function PauseBtn() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const {
    activityStatus,
    duration,
    durationTimerBase,
    durationTimerStartedAt,
    recordingStartedAt,
    recordingTimeZone,
    distance,
    locationsFromBackground: locations,
    kilometresSplit,
  } = useAppShallowSelector(({ location }) => ({
    activityStatus: location.activityStatus,
    duration: location.duration,
    durationTimerBase: location.durationTimerBase,
    durationTimerStartedAt: location.durationTimerStartedAt,
    recordingStartedAt: location.recordingStartedAt,
    recordingTimeZone: location.recordingTimeZone,
    distance: location.distance,
    locationsFromBackground: location.locationsFromBackground,
    kilometresSplit: location.kilometresSplit,
  }));
  const [pressScale] = useState(() => new Animated.Value(1));
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);

  return (
    <TouchableRipple
      testID="activity-pause-toggle"
      borderless
      style={styles.touchable}
      onPressIn={() =>
        Animated.spring(pressScale, { toValue: 0.94, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
      }
      onPressOut={() =>
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
      }
      onPress={async () => {
        if (isTrackingActionInProgress) {
          return;
        }

        setIsTrackingActionInProgress(true);
        try {
          if (activityStatus === STATUSES.paused) {
            await startLocationTracking();
            await resumePedometerActivity();
            dispatch(startDurationTimer(Date.now()));
            dispatch(setTrackingRecoveryStatus(STATUSES.continued));
            dispatch(setActivityStatus(STATUSES.continued));
          } else {
            await stopLocationTracking();
            await pausePedometerActivity();
            const durationForSave = getCurrentActivityDuration({ duration, durationTimerBase, durationTimerStartedAt });
            dispatch(setDurationAt(durationForSave));
            dispatch(stopDurationTimer());
            const routeJournalId = getActiveLocationJournalId();
            const journalLocations = routeJournalId ? readLocationJournal(routeJournalId)?.locations : null;
            const trackedLocations = journalLocations?.length ? journalLocations : locations;
            const elevationGainByKilometre = getElevationGainByKilometres(trackedLocations, kilometresSplit.length);
            dispatch(
              setFinishedActivity({
                duration: durationForSave,
                date: recordingStartedAt ? new Date(recordingStartedAt).toISOString() : undefined,
                timeZone: recordingTimeZone ?? getDeviceTimeZone(),
                distance,
                routeJournalId,
                kilometresSplit: kilometresSplit.map((split, index) => ({
                  ...split,
                  lastKilometerAltitude: elevationGainByKilometre[index] ?? split.lastKilometerAltitude,
                })),
                speed: getSpeedInMinsInKm(distance, durationForSave).paceAsNumber,
              }),
            );
            dispatch(setTrackingRecoveryStatus(STATUSES.paused));
            dispatch(setActivityStatus(STATUSES.paused));
            if (routeJournalId) markLocationJournalPause(routeJournalId);
            dispatch(setEmptyLastArrayWhenPaused());
          }
        } catch (error) {
          errorToast(
            activityStatus === STATUSES.paused ? ACTIVITY_TRACKING_ERROR_COPY.start : ACTIVITY_TRACKING_ERROR_COPY.stop,
            error,
          );
        } finally {
          setIsTrackingActionInProgress(false);
        }
      }}
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
