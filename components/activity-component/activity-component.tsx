import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { ActivityComponentContext } from '../../utils/context/activity-component';
import useStartStopTracking from '../../utils/hooks/use-start-stop-tracking';
import ActivityPauseBtn from '../activity-pause-btn/activity-pause-btn';
import ActivityShowMapBtn from '../activity-show-map-btn/activity-show-map-btn';
import ActivityStartBtn from '../activity-start-btn/activity-start-btn';
import Map from '../map/map';
import Metrics from '../metrics/metrics';

const { initial, paused } = STATUSES;

export default function ActivityComponent() {
  useStartStopTracking();
  const { activityStatus } = useSelector(({ location }) => location);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const { colors } = useTheme();
  const { page, mapOrMetricsWrapper, btnsLayout, controlBtnsWrapper } = styles;

  return (
    <ActivityComponentContext.Provider value={{ isMapVisible, setIsMapVisible }}>
      <View style={page}>
        <View style={mapOrMetricsWrapper}>
          {(activityStatus === initial || isMapVisible) && <Map isMapVisible={isMapVisible} />}
          {activityStatus !== initial && <Metrics isMapVisible={isMapVisible} />}
        </View>
        <View style={controlBtnsWrapper}>
          <View style={[btnsLayout, { backgroundColor: colors.onSecondary }]}>
            {activityStatus === paused && <ActivityPauseBtn />}
            <ActivityStartBtn />
            {activityStatus !== initial && <ActivityShowMapBtn />}
          </View>
        </View>
      </View>
    </ActivityComponentContext.Provider>
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
