import { useMemo } from 'react';
import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { useTheme } from 'react-native-paper';
import { getReducedLocations } from '@U/location/location-utils';
import type { LocationObject } from 'expo-location';

export default function MapRouteLine({ locations }: { locations: LocationObject[] }) {
  const { colors } = useTheme();
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
        style={{ lineColor: colors.primary, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
      />
    </ShapeSource>
  );
}
