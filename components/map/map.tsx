import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { RefObject } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';

import NavIcon from './nav-icon/nav-icon';
import RouteLine from './route-line/route-line';

type MapProps = {
  mapVisible: boolean;
  cameraRef: RefObject<Camera>;
  locations: LocationObject[];
  lastView: number[];
};

export default function Map({ mapVisible, cameraRef, locations, lastView }: MapProps) {
  const { initialLocation } = useSelector(({ location }) => location);
  return (
    <>
      {initialLocation && (
        <MapView style={[{ flex: 1 }, mapVisible && { height: '60%' }]}>
          <UserLocation androidRenderMode="compass" animated />
          <Camera
            ref={cameraRef}
            centerCoordinate={[initialLocation.coords.longitude, initialLocation.coords.latitude]}
            animationMode="flyTo"
            animationDuration={1000}
            zoomLevel={25}
          />
          <NavIcon lastView={lastView} />
          {locations.length > 1 && <RouteLine locations={locations} />}
        </MapView>
      )}
      {!initialLocation && <ActivityIndicator />}
    </>
  );
}
