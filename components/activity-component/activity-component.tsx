import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { STATUSES } from '../../constants/enums';
import { ActivityComponentContext } from '../../utils/context/activity-component';
import useFakeLocations from '../../utils/hooks/use-fake-locations';
import Controls from '../controls/controls';
import Map from '../map/map';
import Metrics from '../metrics/metrics';

export default function ActivityComponent() {
  const { setStatus, status, locations, duration, cameraRef, lastView, distance } = useFakeLocations();
  const { page, monitor, mapContainer } = styles;
  const [mapVisible, setMapVisible] = useState(false);
  const shouldShowMap = status === STATUSES.initial || status === STATUSES.paused || mapVisible;
  return (
    <ActivityComponentContext.Provider
      value={{ setStatus, status, locations, duration, cameraRef, lastView, distance, mapVisible, setMapVisible }}>
      <View style={page}>
        <View style={mapContainer}>
          {shouldShowMap && (
            <Map mapVisible={mapVisible} cameraRef={cameraRef} locations={locations} lastView={lastView} />
          )}

          {status !== STATUSES.initial && <Metrics />}
        </View>
        <View style={monitor}>
          <Controls />
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
  mapContainer: {
    height: '80%',
    width: '100%',
  },
  monitor: {
    height: '20%',
    width: '100%',
  },
});
