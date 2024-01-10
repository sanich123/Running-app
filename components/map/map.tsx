import MapKmSplit from '@C/map-km-split/map-km-split';
import MapRouteLine from '@C/map-route-line/map-route-line';
import { useAppSelector } from '@R/typed-hooks';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export default function Map() {
  const cameraRef = useRef<Camera>(null);
  const { initialLocation, isMapVisible, locationsWithPauses, lastPosition, kilometresSplit } = useAppSelector(
    ({ location }) => location,
  );

  useEffect(() => {
    if (lastPosition) {
      cameraRef.current?.setCamera({
        centerCoordinate: [lastPosition.coords.longitude, lastPosition.coords.latitude],
      });
    }
  }, [lastPosition]);

  return (
    <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
      {Platform.OS === 'ios' ? (
        <UserLocation showsUserHeadingIndicator animated />
      ) : (
        <UserLocation showsUserHeadingIndicator androidRenderMode="compass" animated />
      )}

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
      {/* <MapNavIcon /> */}
      {locationsWithPauses[0]?.length > 1
        ? locationsWithPauses.map((locations: LocationObject[]) => {
            if (locations?.length > 1) {
              const key = `${locations[0].coords.longitude}, ${locations[locations.length - 1].coords.latitude}`;
              return <MapRouteLine key={key} locations={locations} />;
            }
          })
        : null}
    </MapView>
  );
}
