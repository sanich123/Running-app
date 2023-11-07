import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { ToastAndroid } from 'react-native';
import { useSelector } from 'react-redux';

import MapKmSplit from '../map-km-split/map-km-split';
import MapNavIcon from '../map-nav-icon/map-nav-icon';
import MapRouteLine from '../map-route-line/map-route-line';

export default function Map() {
  const cameraRef = useRef<Camera>(null);
  const { initialLocation, isMapVisible, locationsWithPauses, lastPosition, isTooMuchSpeed, kilometresSplit } =
    useSelector(({ location }) => location);

  if (isTooMuchSpeed) {
    ToastAndroid.show('IsTooMuchSpeed, over 3 min/km', ToastAndroid.SHORT);
  } else {
    ToastAndroid.show(
      `Locations have ${locationsWithPauses.reduce((total, el) => total + el.length, 0)}`,
      ToastAndroid.SHORT,
    );
  }
  useEffect(() => {
    if (lastPosition) {
      cameraRef.current?.setCamera({
        centerCoordinate: [lastPosition.coords.longitude, lastPosition.coords.latitude],
      });
    }
  }, [lastPosition]);

  return (
    <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
      <UserLocation showsUserHeadingIndicator androidRenderMode="compass" animated />
      {initialLocation ? (
        <Camera
          ref={cameraRef}
          centerCoordinate={[initialLocation.coords.longitude, initialLocation.coords.latitude]}
          animationMode="flyTo"
          animationDuration={1000}
          zoomLevel={18}
        />
      ) : null}
      <MapKmSplit kilometresSplit={kilometresSplit} />
      <MapNavIcon />
      {locationsWithPauses[0]?.length > 1
        ? locationsWithPauses.map((locations) => {
            if (locations?.length > 1) {
              const key = `${locations[0].coords.longitude}, ${locations[locations.length - 1].coords.latitude}`;
              return <MapRouteLine key={key} locations={locations} />;
            }
          })
        : null}
    </MapView>
  );
}
