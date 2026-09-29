import { MAX_ACTIVITY_LOCATIONS } from './const';
import {
  getAverageCadence,
  getElevationChangeBetweenLocations,
  getElevationGain,
  getElevationGainByKilometres,
  getElevationGainBetweenLocations,
  getKilometerSplitCalculation,
  getDistance,
  getReducedLocations,
  getSpeedInMinsInKm,
  getSpeedInKmPerHour,
  getMaxTrackingSpeedForSport,
  isCyclingActivity,
  isHikingActivity,
  isRunningActivity,
  isWalkingActivity,
  isWalkingOrHikingActivity,
} from './location-utils';
import type { ActivityLocation } from '@S/card/types';

describe('activity metrics', () => {
  it('calculates average cadence in steps per minute', () => {
    expect(getAverageCadence(120, 60_000)).toBe(120);
    expect(getAverageCadence(0, 60_000)).toBe(0);
    expect(getAverageCadence(null, 60_000)).toBe(0);
    expect(getAverageCadence(120, 0)).toBe(0);
  });

  it('calculates cycling speed in kilometres per hour', () => {
    expect(getSpeedInKmPerHour(1_000, 60_000)).toBe(60);
    expect(getSpeedInKmPerHour(0, 60_000)).toBe(0);
    expect(getSpeedInKmPerHour(1_000, 0)).toBe(0);
    expect(getSpeedInKmPerHour(1_000, -1)).toBe(0);
    expect(getSpeedInMinsInKm(0, 60_000)).toEqual({ paceAsNumber: 0, paceAsString: '0.00' });
    expect(getSpeedInMinsInKm(1_000, 60_000).paceAsString).toBe('1.00');
  });

  it('classifies sports used by activity metric displays', () => {
    expect(isRunningActivity('RUNNING')).toBe(true);
    expect(isWalkingActivity('walking')).toBe(true);
    expect(isHikingActivity('HIKING')).toBe(true);
    expect(isWalkingOrHikingActivity('hike')).toBe(true);
    expect(isCyclingActivity('RIDE')).toBe(true);
    expect(isCyclingActivity('cycling')).toBe(true);
    expect(isRunningActivity('hike')).toBe(false);
    expect(isWalkingActivity('run')).toBe(false);
    expect(isHikingActivity('run')).toBe(false);
    expect(isWalkingOrHikingActivity('run')).toBe(false);
    expect(isCyclingActivity('run')).toBe(false);
    expect(getMaxTrackingSpeedForSport('walk')).toBe(15);
    expect(getMaxTrackingSpeedForSport('run')).toBe(30);
    expect(getMaxTrackingSpeedForSport('bike')).toBe(60);
    expect(getMaxTrackingSpeedForSport('hike')).toBe(20);
    expect(getMaxTrackingSpeedForSport('unknown')).toBe(30);
    expect(isCyclingActivity('bike')).toBe(true);
    expect(isHikingActivity('hike')).toBe(true);
    expect(isWalkingOrHikingActivity('walk')).toBe(true);
  });

  it('handles zero cadence and formats paces with and without a leading zero in seconds', () => {
    expect(getAverageCadence(undefined, 60_000)).toBe(0);
    expect(getAverageCadence(120, -1)).toBe(0);
    expect(getSpeedInMinsInKm(1_000, 30_000)).toEqual({ paceAsNumber: 0.3, paceAsString: '0.30' });
    expect(getSpeedInMinsInKm(1_000, 90_000)).toEqual({ paceAsNumber: 1.3, paceAsString: '1.30' });
    expect(getSpeedInKmPerHour(2_000, 60_000)).toBe(120);
  });
});

describe('elevation validation', () => {
  const createLocation = (altitude?: unknown, extra: Record<string, unknown> = {}) =>
    ({
      ...extra,
      coords: {
        latitude: 55,
        longitude: 37,
        altitude,
        altitudeAccuracy: 5,
        ...(extra.coords as Record<string, unknown> | undefined),
      },
    }) as unknown as ActivityLocation;

  it('rejects unreliable altitude samples and accepts reliable timestamp variants', () => {
    expect(getElevationGainBetweenLocations(createLocation(undefined), createLocation(20))).toBe(0);
    expect(getElevationGainBetweenLocations(createLocation(Number.NaN), createLocation(20))).toBe(0);
    expect(
      getElevationGainBetweenLocations(createLocation(100, { coords: { altitudeAccuracy: 16 } }), createLocation(120)),
    ).toBe(0);
    expect(getElevationGainBetweenLocations(createLocation(100, { mocked: true }), createLocation(120))).toBe(0);
    expect(
      getElevationGainBetweenLocations(createLocation(100, { coords: { mocked: true } }), createLocation(120)),
    ).toBe(0);
    expect(getElevationGainBetweenLocations(createLocation(100), createLocation(111))).toBe(11);
    expect(getElevationChangeBetweenLocations(createLocation(100), createLocation(102))).toBe(2);
    expect(getElevationChangeBetweenLocations(createLocation(100), createLocation(89))).toBe(-11);
    expect(getElevationGainBetweenLocations(createLocation(100), createLocation(89))).toBe(0);
    expect(
      getElevationGainBetweenLocations(
        createLocation(100, { timestamp: 10_000 }),
        createLocation(111, { timestamp: 0 }),
      ),
    ).toBe(11);
    expect(
      getElevationGainBetweenLocations(
        createLocation(100, { timestamp: 0 }),
        createLocation(111, { timestamp: 1_000 }),
      ),
    ).toBe(0);
    expect(
      getElevationGainBetweenLocations(
        createLocation(100, { coords: { timestamp: 0 } }),
        createLocation(111, { coords: { timestamp: 10_000 } }),
      ),
    ).toBe(11);
    expect(
      getElevationGainBetweenLocations(createLocation(100, { coords: { altitudeAccuracy: -1 } }), createLocation(120)),
    ).toBe(0);
    expect(
      getElevationGainBetweenLocations(
        createLocation(100, { coords: { altitudeAccuracy: Number.POSITIVE_INFINITY } }),
        createLocation(120),
      ),
    ).toBe(20);
    expect(getElevationGainBetweenLocations(createLocation(100), createLocation(110))).toBe(0);
    expect(
      getElevationGainBetweenLocations(createLocation(100, { timestamp: 0 }), createLocation(120, { timestamp: 0 })),
    ).toBe(20);
    expect(
      getElevationGainBetweenLocations(
        createLocation(100, { timestamp: Number.NaN }),
        createLocation(120, { timestamp: 10_000 }),
      ),
    ).toBe(0);
  });

  it('returns no gain for empty or single-sample tracks and keeps kilometre buckets bounded', () => {
    expect(getElevationGain([])).toBe(0);
    expect(getElevationGain([createLocation(100)])).toBe(0);

    const locations = [100, 115, 130].map((altitude, index) =>
      createLocation(altitude, {
        timestamp: index * 600_000,
        coords: { latitude: 55 + index * 0.02, altitudeAccuracy: 5 },
      }),
    );
    const gainByKilometre = getElevationGainByKilometres(locations, 1);
    expect(gainByKilometre).toHaveLength(1);
    expect(gainByKilometre[0]).toBeGreaterThanOrEqual(0);
  });

  it('accumulates signed elevation changes in each kilometre', () => {
    const metresPerEquatorDegree = 111_195.080233;
    const locations = [100, 100, 100, 136, 136, 136, 136, 136, 124, 124, 124, 124, 124].map((altitude, index) =>
      createLocation(altitude, {
        coords: {
          latitude: 0,
          longitude: (index * 200) / metresPerEquatorDegree,
        },
      }),
    );

    const elevationChangeByKilometre = getElevationGainByKilometres(locations, 2);

    expect(elevationChangeByKilometre[0]).toBeCloseTo(36, 3);
    expect(elevationChangeByKilometre[1]).toBeCloseTo(-12, 3);
  });

  it('smooths sustained climbs, ignores noisy altitude spikes, and handles zero-distance segments', () => {
    const locations = [100, 100, 100, 120, 120, 120, 100, 100, 100].map((altitude, index) =>
      createLocation(altitude, {
        timestamp: index * 10_000,
        coords: { latitude: 55, longitude: 37 + index * 0.001 },
      }),
    );
    expect(getElevationGain(locations)).toBeGreaterThan(0);
    expect(getElevationGainByKilometres(locations, 2)).toHaveLength(2);
    expect(getElevationGainByKilometres([createLocation(100), createLocation(130)], 1)).toEqual([0]);
    expect(getElevationGainByKilometres([createLocation(100), createLocation(120)], -1)).toEqual([]);
    expect(getElevationGainByKilometres([createLocation(100)], 1)).toEqual([null]);
  });
});

describe('kilometre split edge cases', () => {
  it('normalizes invalid segment values and interpolates an endpoint without altitude', () => {
    const result = getKilometerSplitCalculation({
      previousPosition: {
        timestamp: 0,
        coords: { latitude: 55, longitude: 37 },
      } as never,
      currentPosition: {
        timestamp: 1_000,
        coords: { latitude: 55.01, longitude: 37.01, altitude: 50 },
      } as never,
      distance: 0,
      duration: -5,
      altitude: Number.NaN,
      previousKilometerDistance: 1_000,
      previousKilometerDuration: 10,
      previousKilometerAltitude: Number.NaN,
    });

    expect(result.splits).toHaveLength(1);
    expect(result.splits[0].kilometerPoint.coords.altitude).toBe(50);
    expect(result.remainingDistance).toBe(0);
    expect(result.remainingDuration).toBe(0);
    expect(result.remainingAltitude).toBe(0);
  });

  it('splits long GPS gaps at each kilometre and interpolates the GPS sample at split points', () => {
    const result = getKilometerSplitCalculation({
      previousPosition: {
        timestamp: 1_000,
        coords: { latitude: 55, longitude: 37, altitude: 50 },
      } as never,
      currentPosition: {
        timestamp: 11_000,
        coords: { latitude: 55.025, longitude: 37.025, altitude: 75 },
      } as never,
      distance: 2_500,
      duration: 10_000,
      altitude: 25,
      previousKilometerDistance: 250,
      previousKilometerDuration: 1_000,
      previousKilometerAltitude: 5,
    });

    expect(result.splits).toHaveLength(2);
    expect(result.splits[0].kilometerPoint).toMatchObject({
      timestamp: 4_000,
      coords: { latitude: 55.0075, longitude: 37.0075, altitude: 57.5 },
    });
    expect(result.splits[1].kilometerPoint).toMatchObject({
      timestamp: 8_000,
      coords: { latitude: 55.0175, longitude: 37.0175, altitude: 67.5 },
    });
    expect(result.remainingDistance).toBe(750);
    expect(result.remainingDuration).toBe(3_000);
    expect(result.remainingAltitude).toBe(7.5);
  });

  it('uses the latest location if a split has no previous GPS sample', () => {
    const currentPosition = { timestamp: 1_000, coords: { latitude: 55, longitude: 37 } } as never;
    const result = getKilometerSplitCalculation({
      previousPosition: null,
      currentPosition,
      distance: 1_200,
      duration: 12_000,
      altitude: 6,
      previousKilometerDistance: 0,
      previousKilometerDuration: 0,
      previousKilometerAltitude: 0,
    });

    expect(result.splits).toHaveLength(1);
    expect(result.splits[0].kilometerPoint).toBe(currentPosition);
    expect(result.remainingDistance).toBe(200);
  });
});

describe('getDistance', () => {
  it('measures the distance between GPS coordinates in metres', () => {
    const origin = { coords: { latitude: 0, longitude: 0 } } as ActivityLocation;
    const destination = { coords: { latitude: 0, longitude: 1 } } as ActivityLocation;

    expect(getDistance(origin, destination)).toBeCloseTo(111_195, -2);
  });
});

describe('getReducedLocations', () => {
  it('keeps the client payload within the activity location limit', () => {
    const locations = Array.from({ length: MAX_ACTIVITY_LOCATIONS + 250 }, (_, index) => ({
      coords: { latitude: 55 + index / 100_000, longitude: 37 + index / 100_000 },
    }));

    const reducedLocations = getReducedLocations(locations);

    expect(reducedLocations).toHaveLength(MAX_ACTIVITY_LOCATIONS);
    expect(reducedLocations[0]).toBe(locations[0]);
    expect(reducedLocations.at(-1)).toBe(locations.at(-1));
    expect(getReducedLocations(locations.slice(0, 2), 2)).toEqual(locations.slice(0, 2));
  });
});
