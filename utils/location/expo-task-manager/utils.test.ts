import { SPORTS_BTNS_VALUES } from '@const/sports';
import { setSport } from '@R/slices/activity/activity';
import { resetLocationSlice, setLocationsWhenContinued } from '@R/slices/location/location';
import { store } from '@R/store';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import {
  getElevationGain,
  getElevationGainBetweenLocations,
  getKilometerSplitCalculation,
  getSpeedInKmPerHour,
} from '../location-utils';
import { saveMetricsToStoreTaskManager } from './utils';

describe('location speed filtering', () => {
  beforeEach(() => {
    store.dispatch(resetLocationSlice());
  });

  it('calculates speed in kilometres per hour', () => {
    expect(getSpeedInKmPerHour(1000, 60_000)).toBe(60);
  });

  it('skips an implausibly fast running location', () => {
  store.dispatch(setSport(SPORTS_BTNS_VALUES.run));

    saveMetricsToStoreTaskManager(MOCK_LOCATION, 60_000, 0, 0, 1000, null);

    expect(store.getState().location.locationsFromBackground).toEqual([]);
    expect(store.getState().location.isTooMuchSpeed).toBe(true);
    expect(store.getState().location.tooMuchSpeed).toBe(60);
  });

  it('accepts a realistic cycling location at the same distance', () => {
  store.dispatch(setSport(SPORTS_BTNS_VALUES.bike));

    saveMetricsToStoreTaskManager(MOCK_LOCATION, 90_000, 0, 0, 1000, null);

    expect(store.getState().location.locationsFromBackground).toHaveLength(1);
    expect(store.getState().location.isTooMuchSpeed).toBe(false);
  });
});

describe('kilometre split calculation', () => {
  beforeEach(() => {
    store.dispatch(resetLocationSlice());
  });

  it('creates every crossed kilometre and interpolates its point', () => {
    const start = {
      ...MOCK_LOCATION,
      timestamp: 0,
      coords: { ...MOCK_LOCATION.coords, latitude: 55, longitude: 37, altitude: 100 },
    };
    const end = {
      ...MOCK_LOCATION,
      timestamp: 2_500_000,
      coords: { ...MOCK_LOCATION.coords, latitude: 55.025, longitude: 37.05, altitude: 130 },
    };

    const result = getKilometerSplitCalculation({
      previousPosition: start,
      currentPosition: end,
      distance: 2_500,
      duration: 2_500_000,
      altitude: 30,
      previousKilometerDistance: 0,
      previousKilometerDuration: 0,
      previousKilometerAltitude: 0,
    });

    expect(result.splits).toHaveLength(2);
    expect(result.splits.map(({ lastKilometerDuration }) => lastKilometerDuration)).toEqual([1_000_000, 1_000_000]);
    expect(result.splits[0].kilometerPoint.coords.latitude).toBeCloseTo(55.01);
    expect(result.splits[1].kilometerPoint.coords.latitude).toBeCloseTo(55.02);
    expect(result.splits[0].kilometerPoint.timestamp).toBe(1_000_000);
    expect(result.splits[1].kilometerPoint.timestamp).toBe(2_000_000);
    expect(result.remainingDistance).toBe(500);
    expect(result.remainingDuration).toBe(500_000);
    expect(result.remainingAltitude).toBe(6);
  });

  it('continues a partial kilometre from the previous segment', () => {
    const start = { ...MOCK_LOCATION, timestamp: 0 };
    const end = { ...MOCK_LOCATION, timestamp: 1_000_000 };

    const result = getKilometerSplitCalculation({
      previousPosition: start,
      currentPosition: end,
      distance: 2_000,
      duration: 1_000_000,
      altitude: 10,
      previousKilometerDistance: 500,
      previousKilometerDuration: 600_000,
      previousKilometerAltitude: 6,
    });

    expect(result.splits).toHaveLength(2);
    expect(result.splits[0].lastKilometerDuration).toBe(850_000);
    expect(result.splits[1].lastKilometerDuration).toBe(500_000);
    expect(result.remainingDistance).toBe(500);
    expect(result.remainingDuration).toBe(250_000);
    expect(result.remainingAltitude).toBe(2.5);
  });

  it('stores all crossed kilometres and keeps the unfinished remainder', () => {
    const start = {
      ...MOCK_LOCATION,
      timestamp: 0,
      coords: { ...MOCK_LOCATION.coords, latitude: 55, longitude: 37, altitude: 100 },
    };
    const end = {
      ...MOCK_LOCATION,
      timestamp: 600_000,
      coords: { ...MOCK_LOCATION.coords, latitude: 55.025, longitude: 37.05, altitude: 130 },
    };

    store.dispatch(setLocationsWhenContinued(start));
    saveMetricsToStoreTaskManager(end, 600_000, 0, 30, 2_500, start);

    const { location } = store.getState();
    expect(location.kilometresSplit).toHaveLength(2);
    expect(location.kilometresSplit[0].kilometerPoint.coords.latitude).toBeCloseTo(55.01);
    expect(location.kilometresSplit[1].kilometerPoint.coords.latitude).toBeCloseTo(55.02);
    expect(location.lastKilometer).toBe(500);
    expect(location.lastKilometerDuration).toBe(120_000);
    expect(location.lastKilometerAltitude).toBe(6);
    expect(location.distance).toBe(2_500);
    expect(location.duration).toBe(600_000);
    expect(location.altitude).toBe(30);
  });

  it('does not create another split for every update after crossing a kilometre', () => {
    const start = { ...MOCK_LOCATION, timestamp: 0 };
    const firstUpdate = { ...MOCK_LOCATION, timestamp: 120_000 };
    const secondUpdate = { ...MOCK_LOCATION, timestamp: 123_000 };
    const thirdUpdate = { ...MOCK_LOCATION, timestamp: 126_000 };

    store.dispatch(setLocationsWhenContinued(start));
    saveMetricsToStoreTaskManager(firstUpdate, 120_000, 0, 0, 990, start);
    saveMetricsToStoreTaskManager(secondUpdate, 3_000, 0, 0, 20, firstUpdate);
    saveMetricsToStoreTaskManager(thirdUpdate, 3_000, 0, 0, 20, secondUpdate);

    const { location } = store.getState();
    expect(location.kilometresSplit).toHaveLength(1);
    expect(location.lastKilometer).toBe(30);
    expect(location.distance).toBe(1_030);
  });
});

describe('elevation gain calculation', () => {
  it('counts only reliable positive elevation changes', () => {
    const createLocation = (altitude: number, altitudeAccuracy = 10) => ({
      ...MOCK_LOCATION,
      coords: { ...MOCK_LOCATION.coords, altitude, altitudeAccuracy },
    });
    const locations = [
      createLocation(100),
      createLocation(102),
      createLocation(110),
      createLocation(105),
      createLocation(107),
      createLocation(120),
      createLocation(150, 60),
      createLocation(160),
    ];

    expect(getElevationGainBetweenLocations(locations[0], locations[1])).toBe(0);
    expect(getElevationGainBetweenLocations(locations[1], locations[2])).toBe(0);
    expect(getElevationGain(locations)).toBe(18);
  });

  it('ignores short GPS altitude oscillations and counts a sustained climb', () => {
    const createLocation = (altitude: number) => ({
      ...MOCK_LOCATION,
      coords: { ...MOCK_LOCATION.coords, altitude, altitudeAccuracy: 5 },
    });
    const locations = [100, 104, 108, 112, 111, 116, 120, 118, 125].map(createLocation);

    expect(getElevationGain(locations)).toBeGreaterThanOrEqual(15);
    expect(getElevationGain(locations)).toBeLessThan(30);
  });
});
