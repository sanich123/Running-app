import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { View } from '../../components/Themed';
import Controls from '../../components/controls/controls';
import Map from '../../components/map/map';
import Metrics from '../../components/metrics/metrics';
import { STATUSES } from '../../constants/enums';
import useFakeLocations from '../../utils/hooks/use-fake-locations';

export default function Activity() {
  const { setStatus, status, locations, duration, cameraRef, lastView, distance } = useFakeLocations();
  const { page, monitor, mapContainer } = styles;
  const [mapVisible, setMapVisible] = useState(false);
  const shouldShowMap = status === STATUSES.initial || status === STATUSES.paused || mapVisible;

  return (
    <View style={page}>
      <View style={mapContainer}>
        {shouldShowMap && (
          <Map mapVisible={mapVisible} cameraRef={cameraRef} locations={locations} lastView={lastView} />
        )}

        {status !== STATUSES.initial && (
          <Metrics velocity={11} distance={distance} duration={duration} status={status} mapVisible={mapVisible} />
        )}
      </View>
      <View style={monitor}>
        <Controls status={status} setStatus={setStatus} setMapVisible={setMapVisible} mapVisible={mapVisible} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: '80%',
    width: '100%',
  },
  monitor: {
    height: '20%',
    width: '100%',
  },
});

