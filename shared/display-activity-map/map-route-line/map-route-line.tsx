import { useMemo } from 'react';
import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { getReducedLocations } from '@U/location/location-utils';
import type { ActivityLocation } from '@S/card/types';

export default function MapRouteLine({
  locations,
  segmentColors,
  variant = 'activity',
}: {
  locations?: ActivityLocation[] | ActivityLocation[][];
  segmentColors?: string[];
  variant?: 'activity' | 'navigation';
} = {}) {
  const { colors } = useTheme();
  const { locationsWithPauses } = useAppSelector(({ location }) => location);
  const routeLocations = locations ?? locationsWithPauses;
  const routeColor = variant === 'navigation' ? colors.secondary : colors.primary;
  const sourceId = variant === 'navigation' ? 'planned-route' : 'activity-route';
  const { baseRouteFeatures, routeFeatures } = useMemo(() => {
    const segments = Array.isArray(routeLocations[0])
      ? (routeLocations as ActivityLocation[][])
      : [routeLocations as ActivityLocation[]];
    const singleRoute = segments.length === 1 ? segments[0] : undefined;
    const baseRouteFeatures =
      segmentColors?.length && singleRoute && singleRoute.length > 1
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'LineString' as const,
                coordinates: getReducedLocations(singleRoute).map(({ coords }) => [coords.longitude, coords.latitude]),
              },
            },
          ]
        : [];

    if (segmentColors?.length && singleRoute) {
      return {
        baseRouteFeatures,
        routeFeatures: segmentColors.flatMap((color, index) => {
          const start = singleRoute[index];
          const end = singleRoute[index + 1];
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
        }),
      };
    }

    return {
      baseRouteFeatures: [],
      routeFeatures: segments
        .filter((segment) => segment.length > 1)
        .map((segment) => ({
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: getReducedLocations(segment).map(({ coords }) => [coords.longitude, coords.latitude]),
          },
        })),
    };
  }, [routeLocations, segmentColors]);

  if (!routeFeatures.length) {
    return null;
  }

  return (
    <>
      {baseRouteFeatures.length > 0 ? (
        <ShapeSource
          id={`${sourceId}-base`}
          shape={{
            type: 'FeatureCollection',
            features: baseRouteFeatures,
          }}>
          <LineLayer
            id={`${sourceId}-base-line`}
            style={{
              lineColor: routeColor,
              lineWidth: 4,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </ShapeSource>
      ) : null}
      <ShapeSource
        id={sourceId}
        shape={{
          type: 'FeatureCollection',
          features: routeFeatures,
        }}>
        <LineLayer
          id={`${sourceId}-line`}
          style={{
            lineColor: segmentColors?.length ? (['get', 'color'] as const) : routeColor,
            lineWidth: variant === 'navigation' ? 4 : 5,
            lineCap: 'round',
            lineJoin: 'round',
            lineDasharray: variant === 'navigation' ? [2, 1.5] : undefined,
          }}
        />
      </ShapeSource>
    </>
  );
}
