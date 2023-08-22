import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { RefObject } from 'react';

import NavIcon from './nav-icon/nav-icon';
import RouteLine from './route-line/route-line';

import useGetLocation from '../../utils/hooks/use-get-location';

type MapProps = {
  mapVisible: boolean;
  cameraRef: RefObject<Camera>;
  locations: LocationObject[];
  lastView: number[];
};

export default function Map({ mapVisible, cameraRef, locations, lastView }: MapProps) {
  const { readyToShowLocation, location: initialLocation } = useGetLocation();
  const { longitude, latitude } = initialLocation.coords;

  return (
    <MapView style={[{ flex: 1 }, mapVisible && { height: '60%' }]}>
      <UserLocation androidRenderMode="compass" animated />
      {readyToShowLocation && (
        <Camera
          ref={cameraRef}
          centerCoordinate={[longitude, latitude]}
          animationMode="flyTo"
          animationDuration={1000}
          zoomLevel={11}
        />
      )}
      <NavIcon lastView={lastView} />
      {locations.length > 1 && <RouteLine locations={locations} />}
    </MapView>
  );
}
