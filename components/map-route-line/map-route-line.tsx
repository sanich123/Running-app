import { getReducedLocations } from '@U/location-utils';
import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { useMemo } from 'react';
import { Location } from 'react-native-background-geolocation';

export default function MapRouteLine({ locations }: { locations: Location[] }) {
  const coordinates = useMemo(
    () => getReducedLocations(locations).map(({ coords }) => [coords.longitude, coords.latitude]),
    [locations],
  );
  return (
    <ShapeSource
      id={`${locations[0].timestamp}`}
      shape={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        ],
      }}>
      <LineLayer id={`${locations[0].timestamp}+${locations.length}`} style={{ lineColor: 'orange', lineWidth: 5 }} />
    </ShapeSource>
  );
}
