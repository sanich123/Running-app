import ActivityLocationIndicator from '@C/activity-location-indicator/activity-location-indicator';
import ActivityPauseBtn from '@C/activity-pause-btn/activity-pause-btn';
import ActivityShowMapBtn from '@C/activity-show-map-btn/activity-show-map-btn';
import ActivityStartBtn from '@C/activity-start-btn/activity-start-btn';
import Map from '@C/map/map';
import Metrics from '@C/metrics/metrics';
import useStartStopTracking from '@U/hooks/use-start-stop-tracking';
import { STATUSES } from '@const/enums';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

const { initial, paused } = STATUSES;

export default function Activity() {
  useStartStopTracking();
  const { activityStatus, isMapVisible } = useSelector(({ location }) => location);
  const { colors } = useTheme();
  const { page, mapOrMetricsWrapper, btnsLayout, controlBtnsWrapper } = styles;

  return (
    <>
      <ActivityLocationIndicator />
      <View style={page}>
        <View style={mapOrMetricsWrapper}>
          {(activityStatus === initial || isMapVisible) && <Map />}
          {activityStatus !== initial && <Metrics />}
        </View>
        <View style={controlBtnsWrapper}>
          <View style={[btnsLayout, { backgroundColor: colors.onSecondary }]}>
            {activityStatus === paused && <ActivityPauseBtn />}
            <ActivityStartBtn />
            {activityStatus !== initial && <ActivityShowMapBtn />}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOrMetricsWrapper: {
    height: '80%',
    width: '100%',
  },
  controlBtnsWrapper: {
    height: '20%',
    width: '100%',
  },
  btnsLayout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: 15,
  },
});
