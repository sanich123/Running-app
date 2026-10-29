import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import ActivitySettingsButton from '@Routes/activity/activity-settings/activity-settings-button/activity-settings-button';
import CloseBtn from '@Routes/activity/close-btn/close-btn';
import IconChooseSport from '@Routes/activity/icon-choose-sport/icon-choose-sport';
import Map from '@Routes/activity/map/map';
import Metrics from '@Routes/activity/metrics/metrics';
import PauseBtn from '@Routes/activity/pause-btn/pause-btn';
import ShowMapBtn from '@Routes/activity/show-map-btn/show-map-btn';
import StartBtn from '@Routes/activity/start-btn/start-btn';
import { readSavedActivityTrack } from '@U/activity-track/track-library';
import useActivityTrackingLifecycle from './use-activity-tracking-lifecycle';
import type { ActivityLocation } from '@S/card/types';

export default function Activity() {
  const { colors } = useTheme();
  const { activityStatus, isMapVisible, navigationTrackId } = useAppSelector(({ location }) => location);
  const [isLocationReadyForRecording, setIsLocationReadyForRecording] = useState(false);
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);
  const [navigationRoute, setNavigationRoute] = useState<{ trackId: string; locations: ActivityLocation[] } | null>(
    null,
  );
  const { isLocationLoading } = useActivityTrackingLifecycle(isLocationReadyForRecording);

  useEffect(() => {
    let isCurrent = true;
    if (!navigationTrackId) {
      return () => {
        isCurrent = false;
      };
    }
    void readSavedActivityTrack(navigationTrackId).then(
      (locations) => {
        if (isCurrent) setNavigationRoute({ trackId: navigationTrackId, locations });
      },
      () => {
        if (isCurrent) setNavigationRoute({ trackId: navigationTrackId, locations: [] });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [navigationTrackId]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <CloseBtn />,
          headerRight: () => <ActivitySettingsButton />,
        }}
      />
      <SafeAreaView style={[styles.layout, { backgroundColor: colors.surfaceVariant }]} edges={['bottom']}>
        <View style={styles.map}>
          <View
            testID="activity-map-layer"
            style={[styles.mapLayer, !isMapVisible && styles.hiddenMapLayer]}
            pointerEvents={isMapVisible ? 'auto' : 'none'}>
            <Map
              onLocationReadinessChange={setIsLocationReadyForRecording}
              navigationRoute={navigationRoute?.trackId === navigationTrackId ? navigationRoute.locations : undefined}
            />
          </View>
          {activityStatus !== STATUSES.initial ? <Metrics /> : null}
        </View>
        <View style={[styles.metricsLayout, { backgroundColor: colors.surfaceVariant }]}>
          <View style={styles.metrics}>
            {activityStatus === STATUSES.initial ? (
              <IconChooseSport
                disabled={!isLocationReadyForRecording || isLocationLoading || isTrackingActionInProgress}
              />
            ) : null}
            {activityStatus === STATUSES.paused ? <PauseBtn /> : null}
            <StartBtn
              isReadyToRecordLocation={isLocationReadyForRecording}
              isGettingLocation={isLocationLoading}
              onTrackingActionInProgressChange={setIsTrackingActionInProgress}
            />
            {activityStatus !== STATUSES.initial ? <ShowMapBtn /> : null}
          </View>
        </View>
      </SafeAreaView>
    </>
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
