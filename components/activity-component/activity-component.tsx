import { Camera } from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ToastAndroid } from 'react-native';
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
  const { setStatus, status } = useStartStopTracking();
  const cameraRef = useRef<Camera>(null);
  const {
    locationsFromBackground: locations,
    duration,
    distance,
    initialLocation,
  } = useSelector(({ location }) => location);
  const lastPosition = locations.length > 0 ? locations[locations.length - 1] : initialLocation;
  const lastView = [lastPosition?.coords.longitude, lastPosition?.coords.latitude];
  console.log('locations in background is working', locations.length);
  ToastAndroid.show(`Locations have ${locations.length}`, ToastAndroid.SHORT);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const { colors } = useTheme();
  const { page, mapOrMetricsWrapper, btnsLayout, controlBtnsWrapper } = styles;
  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: lastView,
    });
  }, [locations]);
  return (
    <ActivityComponentContext.Provider
      value={{
        setStatus,
        status,
        locations,
        duration,
        cameraRef,
        lastView,
        distance,
        isMapVisible,
        setIsMapVisible,
      }}>
      <View style={page}>
        <View style={mapOrMetricsWrapper}>
          {(status === initial || isMapVisible) && <Map isMapVisible={isMapVisible} />}
          {status !== initial && <Metrics isMapVisible={isMapVisible} />}
        </View>
        <View style={controlBtnsWrapper}>
          <View style={[btnsLayout, { backgroundColor: colors.onSecondary }]}>
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
