import { useMemo } from 'react';
import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { useTheme } from 'react-native-paper';
import { getReducedLocations } from '@U/location/location-utils';
import type { ActivityLocation } from '@S/card/types';

export default function MapRouteLine({
  locations,
  segmentColors,
}: {
  locations: ActivityLocation[] | ActivityLocation[][];
  segmentColors?: string[];
}) {
  const { colors } = useTheme();
  const routeFeatures = useMemo(() => {
    const segments = Array.isArray(locations[0])
      ? (locations as ActivityLocation[][])
      : [locations as ActivityLocation[]];

    if (segmentColors?.length && segments.length === 1) {
      return segmentColors.flatMap((color, index) => {
        const start = segments[0][index];
        const end = segments[0][index + 1];
        if (!start || !end) return [];

        return [
          {
            type: 'Feature' as const,
            properties: { color },
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [start.coords.longitude, start.coords.latitude],
                [end.coords.longitude, end.coords.latitude],
              ],
            },
          },
        ];
      });
    }

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
  }, [locations, segmentColors]);

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
        style={{
          lineColor: segmentColors?.length ? (['get', 'color'] as const) : colors.primary,
          lineWidth: 4,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </ShapeSource>
  );
}
