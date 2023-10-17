import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import ActivityLocationIndicator from '../../../components/activity-location-indicator/activity-location-indicator';
import ActivityPauseBtn from '../../../components/activity-pause-btn/activity-pause-btn';
import ActivityShowMapBtn from '../../../components/activity-show-map-btn/activity-show-map-btn';
import ActivityStartBtn from '../../../components/activity-start-btn/activity-start-btn';
import Map from '../../../components/map/map';
import Metrics from '../../../components/metrics/metrics';
import { STATUSES } from '../../../constants/enums';
import { ActivityComponentContext } from '../../../utils/context/activity-component';
import useStartStopTracking from '../../../utils/hooks/use-start-stop-tracking';

const { initial, paused } = STATUSES;

export default function Activity() {
  useStartStopTracking();
  const { activityStatus, initialLocation } = useSelector(({ location }) => location);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const { colors } = useTheme();
  const { page, mapOrMetricsWrapper, btnsLayout, controlBtnsWrapper } = styles;
  console.log(activityStatus, initialLocation);
  return (
    <>
      <ActivityLocationIndicator />
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
