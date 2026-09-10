import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import {
  setActivityStatus,
  setEmptyLastArrayWhenPaused,
  setIsAppShuted,
  restoreLocationsFromJournal,
  restoreTrackingMetrics,
  setSteps,
  stopDurationTimer,
} from '@R/slices/location/location';
import { clearTrackingRecovery, setTrackingRecoveryStatus } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import IconChooseSport from '@Routes/activity/icon-choose-sport/icon-choose-sport';
import Map from '@Routes/activity/map/map';
import Metrics from '@Routes/activity/metrics/metrics';
import PauseBtn from '@Routes/activity/pause-btn/pause-btn';
import ShowMapBtn from '@Routes/activity/show-map-btn/show-map-btn';
import StartBtn from '@Routes/activity/start-btn/start-btn';
import { errorToast } from '@S/error-toast/error-toast';
import useActivityDurationTimer from '@U/hooks/use-activity-duration-timer';
import useGetCurrentLocation from '@U/hooks/use-get-current-location';
import { stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { markLocationJournalPause, readLocationJournal } from '@U/location/location-journal';
import { pausePedometerActivity, subscribePedometerSteps } from '@U/pedometer/pedometer';

export default function Activity() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);
  const trackingRecovery = useAppSelector(({ trackingRecovery }) => trackingRecovery);
  const initialRecovery = useRef(trackingRecovery);
  const hydratedJournalId = useRef<string | null>(null);
  const [isRecoveringTracking, setIsRecoveringTracking] = useState(
    () => trackingRecovery.status === STATUSES.started || trackingRecovery.status === STATUSES.continued,
  );
  const didPauseRecoveredTracking = useRef(false);
  const [isLocationReadyForRecording, setIsLocationReadyForRecording] = useState(false);
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);
  const { isLoading: isLocationLoading } = useGetCurrentLocation(isLocationReadyForRecording);

  useEffect(() => {
    const recovery = initialRecovery.current;
    if (
      !recovery.journalId ||
      recovery.status === STATUSES.initial ||
      hydratedJournalId.current === recovery.journalId
    ) {
      return;
    }

    const snapshot = readLocationJournal(recovery.journalId);
    if (!snapshot) {
      dispatch(clearTrackingRecovery());
      return;
    }

    hydratedJournalId.current = recovery.journalId;
    dispatch(restoreTrackingMetrics(recovery.metrics));
    dispatch(
      restoreLocationsFromJournal({
        locationsFromBackground: snapshot.locations,
        locationsWithPauses: snapshot.segments,
      }),
    );
    dispatch(setActivityStatus(recovery.status));
  }, [dispatch]);

  useEffect(() => subscribePedometerSteps((steps) => dispatch(setSteps(steps))), [dispatch]);

  useEffect(() => {
    if (!isRecoveringTracking || didPauseRecoveredTracking.current) {
      return;
    }

    didPauseRecoveredTracking.current = true;
    const recoveryJournalId = initialRecovery.current.journalId;
    if (!recoveryJournalId) return;
    stopLocationTracking()
      .then(async () => {
        await pausePedometerActivity();
        dispatch(stopDurationTimer());
        setIsRecoveringTracking(false);
        markLocationJournalPause(recoveryJournalId);
        dispatch(setTrackingRecoveryStatus(STATUSES.paused));
        dispatch(setActivityStatus(STATUSES.paused));
        dispatch(setEmptyLastArrayWhenPaused());
        dispatch(setIsAppShuted(true));
      })
      .catch((error) => errorToast('Не удалось поставить отслеживание на паузу', error));
  }, [dispatch, isRecoveringTracking]);

  useActivityDurationTimer(!isRecoveringTracking);

  return (
    <SafeAreaView style={[styles.layout, { backgroundColor: colors.surfaceVariant }]} edges={['bottom']}>
      <View style={styles.map}>
        <View
          style={[styles.mapLayer, !isMapVisible && styles.hiddenMapLayer]}
          pointerEvents={isMapVisible ? 'auto' : 'none'}>
          <Map onLocationReadinessChange={setIsLocationReadyForRecording} />
        </View>
        {activityStatus !== STATUSES.initial && <Metrics />}
      </View>
      <View style={[styles.metricsLayout, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.metrics}>
          {activityStatus === STATUSES.initial && (
            <IconChooseSport
              disabled={!isLocationReadyForRecording || isLocationLoading || isTrackingActionInProgress}
            />
          )}
          {activityStatus === STATUSES.paused && <PauseBtn />}
          <StartBtn
            isReadyToRecordLocation={isLocationReadyForRecording}
            isGettingLocation={isLocationLoading}
            onTrackingActionInProgressChange={setIsTrackingActionInProgress}
          />
          {activityStatus !== STATUSES.initial && <ShowMapBtn />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    height: Platform.OS === 'ios' ? '80%' : '75%',
    width: '100%',
  },
  mapLayer: {
    flex: 1,
  },
  hiddenMapLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0,
  },
  metricsLayout: {
    height: Platform.OS === 'ios' ? '20%' : '25%',
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  metrics: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    transform: Platform.OS === 'ios' ? [{ translateY: -10 }] : undefined,
  },
});
