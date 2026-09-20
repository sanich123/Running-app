import { MAX_ACTIVITY_LOCATIONS } from './const';
import {
  getAverageCadence,
  getElevationChangeBetweenLocations,
  getElevationGain,
  getElevationGainByKilometres,
  getElevationGainBetweenLocations,
  getKilometerSplitCalculation,
  getMapBoxImage,
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
    expect(getMaxTrackingSpeedForSport('unknown')).toBe(30);
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
});

describe('getMapBoxImage', () => {
  it('requests a square map for the square share image', () => {
    const imageUrl = getMapBoxImage([
      { coords: { latitude: 55.75, longitude: 37.61 } },
      { coords: { latitude: 55.76, longitude: 37.62 } },
    ]);

    expect(imageUrl).toContain('/360x360@2x');
    expect(imageUrl).toContain('&attribution=false&logo=false');
  });

  it('requests a map with the dimensions of the activity card', () => {
    const imageUrl = getMapBoxImage(
      [{ coords: { latitude: 55.75, longitude: 37.61 } }, { coords: { latitude: 55.76, longitude: 37.62 } }],
      { width: 351, height: 202 },
    );

    expect(imageUrl).toContain('/351x202@2x');
  });

  it('returns an empty URL for invalid locations and draws markers for a single point', () => {
    expect(getMapBoxImage([{ coords: { latitude: Number.NaN, longitude: 37 } }])).toBe('');
    const imageUrl = getMapBoxImage([{ coords: { latitude: 55.75, longitude: 37.61 } }]);
    expect(imageUrl).toContain('pin-s');
    expect(imageUrl).not.toContain('path-2');
  });

  it('reduces an oversized static map route before returning it', () => {
    const previousToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    process.env.EXPO_PUBLIC_MAPBOX_TOKEN = 'token'.repeat(2_000);
    const imageUrl = getMapBoxImage(
      Array.from({ length: 4 }, (_, index) => ({
        coords: { latitude: 55 + index / 100, longitude: 37 + index / 100 },
      })),
    );
    expect(imageUrl).toContain('/360x360@2x');
    process.env.EXPO_PUBLIC_MAPBOX_TOKEN = previousToken;
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
