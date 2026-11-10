import { getDistanceToRouteMeters } from './route-proximity';
import type { ActivityLocation } from '@S/card/types';

function location(latitude: number, longitude: number): ActivityLocation {
  return { coords: { latitude, longitude } };
}

describe('route proximity', () => {
  const route = [location(0, 0), location(0, 0.001)];

  it('measures distance to the nearest point on the route segment', () => {
    expect(getDistanceToRouteMeters(location(0.001, 0.0005), route)).toBeCloseTo(111.2, 1);
  });

  it('returns zero for a position on the route', () => {
    expect(getDistanceToRouteMeters(location(0, 0.0005), route)).toBeCloseTo(0, 5);
  });

  it('ignores an invalid position and a route with fewer than two points', () => {
    expect(getDistanceToRouteMeters(location(Number.NaN, 0), route)).toBeNull();
    expect(getDistanceToRouteMeters(location(0, 0), [route[0]!])).toBeNull();
  });

  it('ignores invalid route segments and returns null when no valid segment remains', () => {
    const invalid = location(100, 0);
    expect(getDistanceToRouteMeters(location(0, 0), [route[0]!, invalid, route[1]!])).toBeNull();
    const gapInRoute: ActivityLocation[] = [route[0]!, undefined as never, route[1]!];
    expect(getDistanceToRouteMeters(location(0, 0), gapInRoute)).toBeNull();
  });

  it('measures distance to duplicate points and beyond segment endpoints', () => {
    expect(getDistanceToRouteMeters(location(0.001, 0), [location(0, 0), location(0, 0)])).toBeCloseTo(111.2, 1);
    expect(getDistanceToRouteMeters(location(0, 0.002), route)).toBeCloseTo(111.2, 1);
  });

  it('handles routes that cross the antimeridian and rejects invalid longitudes', () => {
    const crossingRoute = [location(0, 179.999), location(0, -179.999)];
    expect(getDistanceToRouteMeters(location(0.001, 180), crossingRoute)).toBeCloseTo(111.2, 1);
    expect(getDistanceToRouteMeters(location(0, 181), crossingRoute)).toBeNull();
  });
});
