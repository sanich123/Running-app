import MapboxWeb from '@C/mapbox-web/mapbox-web';
import { LastKmSplit } from '@R/location/types';
import { MapView, Camera } from '@rnmapbox/maps';
import bbox from '@turf/bbox';
import { LocationObject } from 'expo-location';
import { useMemo } from 'react';
import { Platform } from 'react-native';
//@ts-ignore
import lineString from 'turf-linestring';

import MapKmSplit from '../map-km-split/map-km-split';
import RouteLine from '../map-route-line/map-route-line';

type DisplayActivityMapProps = {
  locations: LocationObject[];
  kilometresSplit: LastKmSplit[];
};

export default function DisplayActivityMap({ locations, kilometresSplit }: DisplayActivityMapProps) {
  const modifiedLocationsForTurf = useMemo(
    () => locations.map(({ coords: { longitude, latitude } }) => [latitude, longitude]),
    [locations],
  );
  const modifiedLocationsForMapboxGl = useMemo(
    () => locations.map(({ coords: { longitude, latitude } }) => [longitude, latitude]),
    [locations],
  );
  const line = lineString(modifiedLocationsForTurf);
  const [minLat, minLng, maxLat, maxLng] = bbox(line);

  return (
    <>
      {Platform.OS === 'web' ? (
        <MapboxWeb
          kilometresSplit={kilometresSplit}
          boundBox={[minLng, maxLat, maxLng, minLat]}
          modifiedLocationsForTurf={modifiedLocationsForMapboxGl}
        />
      ) : (
        <MapView style={[{ flex: 1 }]}>
          <Camera
            animationMode="flyTo"
            animationDuration={1000}
            bounds={{ ne: [minLng, minLat], sw: [maxLng, maxLat] }}
            padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
          />
          {locations.length > 1 && <RouteLine locations={locations} />}
          <MapKmSplit kilometresSplit={kilometresSplit} />
        </MapView>
      )}
    </>
  );
}
