import { getDistance } from '@U/location/location-utils';
import { calculateWatchWorkoutKilometreSplits } from './kilometre-splits';
import type { LocationObject } from 'expo-location';

function createLocation(longitude: number, timestamp: number, altitude?: number): LocationObject {
  return {
    timestamp,
    coords: {
      latitude: 0,
      longitude,
      altitude: altitude ?? null,
      altitudeAccuracy: altitude === undefined ? null : 5,
      accuracy: null,
      heading: null,
      speed: null,
    },
  };
}

describe('Health Connect kilometre splits', () => {
  it('creates completed splits from a GPS route and interpolates the kilometre point', () => {
    const route = [createLocation(0, 1_000, 10), createLocation(0.009, 11_000, 20), createLocation(0.018, 21_000, 30)];
    const routeDistance = getDistance(route[0], route[1]) + getDistance(route[1], route[2]);
    const splits = calculateWatchWorkoutKilometreSplits(route, 20_000, routeDistance);

    expect(splits).toHaveLength(2);
    expect(splits[0].lastKilometerDuration).toBeGreaterThan(0);
    expect(splits[0].kilometerPoint.coords.longitude).toBeGreaterThan(0);
    expect(splits[0].kilometerPoint.coords.longitude).toBeLessThan(0.009);
    expect(splits[0].lastKilometerAltitude).toBeGreaterThan(0);
  });

  it('uses GPS distance when Health Connect has no usable total distance', () => {
    const route = [createLocation(0, 1_000), createLocation(0.009, 11_000), createLocation(0.018, 21_000)];

    expect(calculateWatchWorkoutKilometreSplits(route, 20_000, 0)).toHaveLength(2);
  });

  it('does not invent splits without enough valid route points', () => {
    const invalid = createLocation(Number.NaN, 1_000);
    const valid = createLocation(0, 11_000);

    expect(calculateWatchWorkoutKilometreSplits([], 20_000, 2_000)).toEqual([]);
    expect(calculateWatchWorkoutKilometreSplits([valid], 20_000, 2_000)).toEqual([]);
    expect(calculateWatchWorkoutKilometreSplits([invalid, valid], 20_000, 2_000)).toEqual([]);
  });
});
