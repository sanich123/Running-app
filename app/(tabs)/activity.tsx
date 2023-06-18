import { StyleSheet } from 'react-native';
import { View } from '../../components/Themed';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import useFakeLocations from '../../hooks/use-fake-locations';
import RouteLine from '../../components/route-line/route-line';
import NavIcon from '../../components/nav-icon/nav-icon';
import Metrics from '../../components/metrics/metrics';
import ControlBtns from '../../components/control-btns/control-btns';
import { STATUSES } from '../../constants/enums';
import { useState } from 'react';
import useGetLocation from '../../hooks/use-get-location';

export default function Activity() {
  const { readyToShowLocation, location: initialLocation } = useGetLocation();
  const { longitude, latitude } = initialLocation.coords;
  const { setStatus, status, locations, duration, cameraRef, lastView, distance } = useFakeLocations();
  const { page, monitor, mapContainer, map } = styles;
  const [mapVisible, setMapVisible] = useState(false);
  const shouldShowMap = status === STATUSES.initial || status === STATUSES.paused || mapVisible;

  return (
    <View style={page}>
      <View style={mapContainer}>
        {shouldShowMap && (
          <MapView style={[map, mapVisible && { height: '60%' }]}>
            <UserLocation androidRenderMode="compass" animated />
            {readyToShowLocation && (
              <Camera ref={cameraRef} centerCoordinate={[longitude, latitude]} animationMode="flyTo" animationDuration={1000} zoomLevel={11} />
            )}
            <NavIcon lastView={lastView} />
            {locations.length > 1 && <RouteLine locations={locations} />}
          </MapView>
        )}

        {status !== STATUSES.initial && <Metrics velocity={11} distance={distance} duration={duration} status={status} mapVisible={mapVisible} />}
      </View>
      <View style={monitor}>
        <ControlBtns status={status} setStatus={setStatus} setMapVisible={setMapVisible} mapVisible={mapVisible} />
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
  map: {
    flex: 1,
  },
});
