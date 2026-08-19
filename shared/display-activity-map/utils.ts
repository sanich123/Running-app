import getBbox from '@turf/bbox';
import lineString from 'turf-linestring';
import type { ActivityLocation } from '@S/card/types';

export function getActivityMapBounds(locations: ActivityLocation[]) {
  const routeCoordinates = locations.map(({ coords: { longitude, latitude } }) => [longitude, latitude]);
  const [minLng, minLat, maxLng, maxLat] = getBbox(lineString(routeCoordinates));

  return {
    boundBox: [minLng, minLat, maxLng, maxLat] as [number, number, number, number],
    bounds: {
      ne: [maxLng, maxLat] as [number, number],
      sw: [minLng, minLat] as [number, number],
    },
    routeCoordinates,
  };
}
