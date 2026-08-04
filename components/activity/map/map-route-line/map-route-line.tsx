import { useMemo } from 'react';
import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { POWERHOURS_COLORS } from '@const/theme-colors';
import { getReducedLocations } from '@U/location/location-utils';
import type { LocationObject } from 'expo-location';

export default function MapRouteLine({ locations }: { locations: LocationObject[] }) {
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
      <LineLayer
        id={`${locations[0].timestamp}+${locations.length}`}
        style={{ lineColor: POWERHOURS_COLORS.success, lineWidth: 2 }}
      />
    </ShapeSource>
  );
}
