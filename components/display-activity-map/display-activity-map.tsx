import { MapView, Camera } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { usePathname } from 'expo-router';
import { getBoundsOfDistance, getCenterOfBounds } from 'geolib';
import { useEffect, useRef } from 'react';

import RouteLine from '../map-route-line/map-route-line';

export default function DisplayActivityMap({ locations, distance }: { locations: LocationObject[]; distance: number }) {
  const pathname = usePathname();
  const modifiedLocations = locations.map(({ coords: { longitude, latitude } }) => ({
    longitude,
    latitude,
  }));
  const cameraRef = useRef<Camera>(null);
  const center = getCenterOfBounds(modifiedLocations);
  const [{ latitude: swLatitude, longitude: swLongitude }, { latitude: neLatitude, longitude: neLongitude }] =
    getBoundsOfDistance(center, distance);

  useEffect(() => {
    cameraRef.current?.fitBounds([neLongitude, neLatitude], [swLongitude, swLatitude]);
  }, []);

  return (
    <MapView style={[{ flex: 1 }, pathname.includes('/comment') && { height: 200 }]} scaleBarEnabled={false}>
      <Camera
        animationMode="flyTo"
        animationDuration={1000}
        ref={cameraRef}
        bounds={{ ne: [neLongitude, neLatitude], sw: [swLongitude, swLatitude] }}
      />
      {locations.length > 1 && <RouteLine locations={locations} />}
    </MapView>
  );
}
