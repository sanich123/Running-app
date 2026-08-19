import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import { setActivityStatus, setEmptyLastArrayWhenPaused, setIsAppShuted } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import IconChooseSport from '@Routes/activity/icon-choose-sport/icon-choose-sport';
import Map from '@Routes/activity/map/map';
import Metrics from '@Routes/activity/metrics/metrics';
import PauseBtn from '@Routes/activity/pause-btn/pause-btn';
import ShowMapBtn from '@Routes/activity/show-map-btn/show-map-btn';
import StartBtn from '@Routes/activity/start-btn/start-btn';
import { errorToast } from '@S/error-toast/error-toast';
import useGetCurrentLocation from '@U/hooks/use-get-current-location';
import { stopLocationTracking } from '@U/location/expo-task-manager/background-location';

export default function Activity() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);
  const shouldPauseRecoveredTracking = useRef(
    activityStatus === STATUSES.started || activityStatus === STATUSES.continued,
  );
  const didPauseRecoveredTracking = useRef(false);
  const [isLocationReadyForRecording, setIsLocationReadyForRecording] = useState(false);
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);
  const { isLoading: isLocationLoading } = useGetCurrentLocation(isLocationReadyForRecording);

  useEffect(() => {
    if (!shouldPauseRecoveredTracking.current || didPauseRecoveredTracking.current) {
      return;
    }

    didPauseRecoveredTracking.current = true;
    stopLocationTracking()
      .then(() => {
        dispatch(setActivityStatus(STATUSES.paused));
        dispatch(setEmptyLastArrayWhenPaused());
        dispatch(setIsAppShuted(true));
      })
      .catch((error) => errorToast('Не удалось поставить отслеживание на паузу', error));
  }, [dispatch]);

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
