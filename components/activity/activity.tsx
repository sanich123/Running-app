import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import IconChooseSport from '@C/activity/icon-choose-sport/icon-choose-sport';
import Map from '@C/activity/map/map';
import PauseBtn from '@C/activity/pause-btn/pause-btn';
import ShowMapBtn from '@C/activity/show-map-btn/show-map-btn';
import StartBtn from '@C/activity/start-btn/start-btn';
import Metrics from '@C/metrics/metrics';
import { STATUSES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import useStartStopTracking from '@U/hooks/use-start-stop-tracking';

export default function Activity() {
  const { colors } = useTheme();
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);
  useStartStopTracking();
  const [isReadyToRecordLocation, setIsReadyToRecordLocation] = useState(false);

  return (
    <SafeAreaView style={[styles.layout, { backgroundColor: colors.surfaceVariant }]} edges={['bottom']}>
      <View style={styles.map}>
        {(activityStatus === STATUSES.initial || isMapVisible) && (
          <Map setIsReadyToRecordLocation={setIsReadyToRecordLocation} />
        )}
        {activityStatus !== STATUSES.initial && <Metrics />}
      </View>
      <View style={[styles.metricsLayout, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.metrics}>
          {activityStatus === STATUSES.initial && <IconChooseSport />}
          {activityStatus === STATUSES.paused && <PauseBtn />}
          <StartBtn isReadyToRecordLocation={isReadyToRecordLocation} />
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
