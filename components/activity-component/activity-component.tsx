import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { STATUSES } from '../../constants/enums';
import { ActivityComponentContext } from '../../utils/context/activity-component';
import useFakeLocations from '../../utils/hooks/use-fake-locations';
import ActivityPauseBtn from '../activity-pause-btn/activity-pause-btn';
import ActivityShowMapBtn from '../activity-show-map-btn/activity-show-map-btn';
import ActivityStartBtn from '../activity-start-btn/activity-start-btn';
import Map from '../map/map';
import Metrics from '../metrics/metrics';

const { initial, paused } = STATUSES;

export default function ActivityComponent() {
  const { setStatus, status, locations, duration, cameraRef, lastView, distance } = useFakeLocations();
  const [isMapVisible, setIsMapVisible] = useState(false);
  const { colors } = useTheme();

  return (
    <ActivityComponentContext.Provider
      value={{ setStatus, status, locations, duration, cameraRef, lastView, distance, isMapVisible, setIsMapVisible }}>
      <View style={styles.page}>
        <View style={styles.mapOrMetricsWrapper}>
          {(status === initial || isMapVisible) && <Map isMapVisible={isMapVisible} />}
          {status !== initial && <Metrics isMapVisible={isMapVisible} />}
        </View>
        <View style={styles.controlBtnsWrapper}>
          <View style={[styles.btnsLayout, { backgroundColor: colors.onSecondary }]}>
            {status === paused && <ActivityPauseBtn />}
            <ActivityStartBtn />
            {status !== initial && <ActivityShowMapBtn />}
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
