import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { useContext } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { ActivityComponentContext } from '../../utils/context/activity-component';
import MapNavIcon from '../map-nav-icon/map-nav-icon';
import MapRouteLine from '../map-route-line/map-route-line';

export default function Map({ isMapVisible }: { isMapVisible: boolean }) {
  const { initialLocation } = useSelector(({ location }) => location);
  const { cameraRef, locations, lastView } = useContext(ActivityComponentContext);
  return (
    <>
      {initialLocation?.coords ? (
        <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
          <UserLocation androidRenderMode="compass" animated />
          <Camera
            ref={cameraRef}
            centerCoordinate={[initialLocation?.coords.longitude, initialLocation?.coords.latitude]}
            animationMode="flyTo"
            animationDuration={1000}
            zoomLevel={25}
          />
          <MapNavIcon lastView={lastView} />
          {locations.length > 1 && <MapRouteLine locations={locations} />}
        </MapView>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </>
  );
}
