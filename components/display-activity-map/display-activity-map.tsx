import RouteLine from '@c/map/route-line/route-line';
import { Camera, MapView } from '@rnmapbox/maps';
import useFakeLocations from '@u/hooks/use-fake-locations';
import { LocationObject } from 'expo-location';
import { usePathname } from 'expo-router';
import { getBoundsOfDistance, getCenterOfBounds } from 'geolib';
import { useEffect } from 'react';

export default function DisplayActivityMap({ locations, distance }: { locations: LocationObject[]; distance: number }) {
  const pathname = usePathname();
  const modifiedLocations = locations.map(({ coords: { longitude, latitude } }) => ({
    longitude,
    latitude,
  }));
  const { cameraRef } = useFakeLocations();
  const center = getCenterOfBounds(modifiedLocations);
  const [{ latitude: swLatitude, longitude: swLongitude }, { latitude: neLatitude, longitude: neLongitude }] =
    getBoundsOfDistance(center, distance);

  useEffect(() => {
    if (cameraRef?.current) {
      cameraRef.current.fitBounds([neLongitude, neLatitude], [swLongitude, swLatitude]);
    }
  }, []);

  return (
    <MapView style={[{ flex: 1 }, pathname.includes('/comment') && { height: 200 }]} scaleBarEnabled={false}>
      <Camera
        animationMode="flyTo"
        animationDuration={1000}
        zoomLevel={25}
        ref={cameraRef}
        centerCoordinate={[center.longitude, center.latitude]}
        bounds={{ ne: [neLongitude, neLatitude], sw: [swLongitude, swLatitude] }}
      />
      {locations.length > 1 && <RouteLine locations={locations} />}
    </MapView>
  );
}
