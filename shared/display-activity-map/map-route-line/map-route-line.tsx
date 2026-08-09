import { useMemo } from 'react';
import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { useTheme } from 'react-native-paper';
import { getReducedLocations } from '@U/location/location-utils';
import type { LocationObject } from 'expo-location';

export default function MapRouteLine({ locations }: { locations: LocationObject[] | LocationObject[][] }) {
  const { colors } = useTheme();
  const routeFeatures = useMemo(() => {
    const segments = Array.isArray(locations[0]) ? (locations as LocationObject[][]) : [locations as LocationObject[]];

    return segments
      .filter((segment) => segment.length > 1)
      .map((segment) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: getReducedLocations(segment).map(({ coords }) => [coords.longitude, coords.latitude]),
        },
      }));
  }, [locations]);

  if (!routeFeatures.length) {
    return null;
  }

  return (
    <ShapeSource
      id="activity-route"
      shape={{
        type: 'FeatureCollection',
        features: routeFeatures,
      }}>
      <LineLayer
        id="activity-route-line"
        style={{ lineColor: colors.primary, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
      />
    </ShapeSource>
  );
}
