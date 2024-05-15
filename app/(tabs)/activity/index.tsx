import LocationIndicator from '@C/activity/location-indicator/location-indicator';
import Map from '@C/activity/map/map';
import PauseBtn from '@C/activity/pause-btn/pause-btn';
import ShowMapBtn from '@C/activity/show-map-btn/show-map-btn';
import StartBtn from '@C/activity/start-btn/start-btn';
import Metrics from '@C/metrics/metrics';
import { useAppSelector } from '@R/typed-hooks';
import useGetPermissions from '@U/hooks/use-get-permission';
import useStartStopTracking from '@U/hooks/use-start-stop-tracking';
import { STATUSES } from '@const/enums';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function Activity() {
  const { colors } = useTheme();
  useStartStopTracking();
  useGetPermissions();
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);

  return (
    <View style={styles.layout}>
      <LocationIndicator />
      <View style={styles.map}>
        {(activityStatus === STATUSES.initial || isMapVisible) && <Map />}
        {activityStatus !== STATUSES.initial && <Metrics />}
      </View>
      <View style={styles.metricsLayout}>
        <View style={[styles.metrics, { backgroundColor: colors.surfaceVariant }]}>
          {activityStatus === STATUSES.paused && <PauseBtn />}
          <StartBtn />
          {activityStatus !== STATUSES.initial && <ShowMapBtn />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    height: '80%',
    width: '100%',
  },
  metricsLayout: {
    height: '20%',
    width: '100%',
  },
  metrics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: 8,
  },
});
