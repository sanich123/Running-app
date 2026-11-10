import type { OfflineBounds } from '@Routes/maps-page/const';
import type { ActivityLocation } from '@S/card/types';

interface NavigationRouteBounds {
  east: number;
  north: number;
  pointCount: number;
  south: number;
  west: number;
}

export function getNavigationRouteBounds(locations: ActivityLocation[] | null): NavigationRouteBounds | null {
  return (
    locations?.reduce<NavigationRouteBounds | null>((bounds, { coords }) => {
      const { latitude, longitude } = coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return bounds;
      return bounds
        ? {
            east: Math.max(bounds.east, longitude),
            north: Math.max(bounds.north, latitude),
            pointCount: bounds.pointCount + 1,
            south: Math.min(bounds.south, latitude),
            west: Math.min(bounds.west, longitude),
          }
        : { east: longitude, north: latitude, pointCount: 1, south: latitude, west: longitude };
    }, null) ?? null
  );
}

export function getNavigationRouteOfflineBounds(routeBounds: NavigationRouteBounds): OfflineBounds {
  return [
    [routeBounds.east, routeBounds.north],
    [routeBounds.west, routeBounds.south],
  ];
}

export function getOfflineMapBoundsCenter(bounds: OfflineBounds): [number, number] {
  const [[east, north], [west, south]] = bounds;
  const longitudeSpan = ((east - west + 540) % 360) - 180;
  const longitude = ((west + longitudeSpan / 2 + 540) % 360) - 180;
  return [longitude, (north + south) / 2];
}
