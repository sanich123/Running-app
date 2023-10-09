import { Camera } from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { ActivityComponentContext } from '../../utils/context/activity-component';
import { useLocationData } from '../../utils/hooks/use-location';
import useUserLocation from '../../utils/hooks/use-user-location';
import ActivityPauseBtn from '../activity-pause-btn/activity-pause-btn';
import ActivityShowMapBtn from '../activity-show-map-btn/activity-show-map-btn';
import ActivityStartBtn from '../activity-start-btn/activity-start-btn';
import Map from '../map/map';
import Metrics from '../metrics/metrics';

const { initial, paused } = STATUSES;

export default function ActivityComponent() {
  const { initialLocation } = useSelector(({ location }) => location);
  const { setStatus, status } = useUserLocation();
  const { storedLocations, storedDistance, storedDuration } = useLocationData();
  console.log('locations from asyncStorage', storedLocations, storedLocations.length);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const { colors } = useTheme();
  const { page, mapOrMetricsWrapper, btnsLayout, controlBtnsWrapper } = styles;
  const cameraRef = useRef<Camera>(null);
  const lastPosition = storedLocations.length > 0 ? storedLocations[storedLocations.length - 1] : initialLocation;
  const lastView = [lastPosition?.coords.longitude, lastPosition?.coords.latitude];
  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: lastView,
    });
  }, [storedLocations]);
  return (
    <ActivityComponentContext.Provider
      value={{
        setStatus,
        status,
        locations: storedLocations,
        duration: storedDuration,
        cameraRef,
        lastView,
        distance: storedDistance,
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
