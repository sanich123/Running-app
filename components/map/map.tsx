import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { ToastAndroid } from 'react-native';
import { useSelector } from 'react-redux';

import MapKmSplit from '../map-km-split/map-km-split';
import MapNavIcon from '../map-nav-icon/map-nav-icon';
import MapRouteLine from '../map-route-line/map-route-line';

export default function Map({ isMapVisible }: { isMapVisible: boolean }) {
  const cameraRef = useRef<Camera>(null);
  const { initialLocation, locationsFromBackground: locations } = useSelector(({ location }) => location);

  const lastPosition = locations.length > 0 ? locations[locations.length - 1] : initialLocation;
  const lastView = [lastPosition?.coords?.longitude, lastPosition?.coords?.latitude];
  ToastAndroid.show(`Locations have ${locations.length}`, ToastAndroid.SHORT);

  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: lastView,
    });
  }, [locations]);

  return (
    <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
      <UserLocation
        androidRenderMode="compass"
        animated
        onUpdate={(location) => console.log('userlocation', location)}
      />
      <Camera
        ref={cameraRef}
        centerCoordinate={lastView}
        animationMode="flyTo"
        animationDuration={1000}
        zoomLevel={18}
      />
      <MapKmSplit />
      {lastView.length > 0 ? <MapNavIcon lastView={lastView} /> : null}
      {locations.length > 1 && <MapRouteLine locations={locations} />}
    </MapView>
  );
}
