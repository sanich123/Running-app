import MapKmSplit from '@C/map-km-split/map-km-split';
import MapRouteLine from '@C/map-route-line/map-route-line';
import { useAppSelector } from '@R/typed-hooks';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { Platform } from 'react-native';

export default function Map() {
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);

  return (
    <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
      {Platform.OS === 'ios' ? (
        <UserLocation showsUserHeadingIndicator animated />
      ) : (
        <UserLocation showsUserHeadingIndicator androidRenderMode="compass" animated />
      )}
      <Camera followUserLocation followZoomLevel={18} animationMode="flyTo" />
      <MapKmSplit kilometresSplit={kilometresSplit} />
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
