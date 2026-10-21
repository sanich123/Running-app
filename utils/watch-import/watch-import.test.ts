import { getDistance } from '@U/location/location-utils';
import { getWatchImportDateRange, mapWatchWorkoutToActivity } from './helpers';
import type { WatchWorkout } from '../../modules/runich-health/src/RunichHealth';

describe('watch import mapping', () => {
  it('uses a rolling thirty-day window', () => {
    expect(getWatchImportDateRange(new Date('2026-10-06T12:00:00.000Z'))).toEqual({
      startDate: '2026-09-06T12:00:00.000Z',
      endDate: '2026-10-06T12:00:00.000Z',
    });
  });

  it('maps native workout metrics to the activity contract and keeps the source identity', () => {
    expect(
      mapWatchWorkoutToActivity({
        source: 'health-connect',
        sourceActivityId: 'record-1',
        date: '2026-10-05T07:00:00.000Z',
        timeZone: 'Europe/Moscow',
        sport: 'run',
        duration: 600_000,
        distance: 2_000,
        steps: 2_400,
        locations: [
          {
            timestamp: 1,
            coords: { latitude: 55.75, longitude: 37.61 },
          },
        ],
      }),
    ).toMatchObject({
      source: 'health-connect',
      sourceActivityId: 'record-1',
      sport: 'run',
      duration: 600_000,
      distance: 2_000,
      steps: 2_400,
      speed: 5,
      locations: [{ coords: { latitude: 55.75, longitude: 37.61, altitude: null } }],
    });
  });

  it('adds kilometre splits when the imported workout contains a usable route', () => {
    const locations: WatchWorkout['locations'] = [
      { timestamp: 1_000, coords: { latitude: 0, longitude: 0 } },
      { timestamp: 11_000, coords: { latitude: 0, longitude: 0.009 } },
      { timestamp: 21_000, coords: { latitude: 0, longitude: 0.018 } },
    ];
    const routeDistance = getDistance(locations[0], locations[1]) + getDistance(locations[1], locations[2]);
    const mappedWorkout = mapWatchWorkoutToActivity({
      source: 'health-connect',
      sourceActivityId: 'record-with-route',
      date: '2026-10-05T07:00:00.000Z',
      timeZone: 'Europe/Moscow',
      sport: 'run',
      duration: 20_000,
      distance: routeDistance,
      locations,
    });

    expect(mappedWorkout.kilometresSplit).toHaveLength(2);
    expect(mappedWorkout.kilometresSplit?.[0].kilometerPoint.coords.longitude).toBeGreaterThan(0);
  });

  it('forwards valid Health Connect calories and omits invalid values', () => {
    const workout: WatchWorkout = {
      source: 'health-connect',
      sourceActivityId: 'record-with-calories',
      date: '2026-10-05T07:00:00.000Z',
      timeZone: 'Europe/Moscow',
      sport: 'run',
      duration: 600_000,
      distance: 2_000,
      caloriesActive: 276.4,
      locations: [],
    };

    expect(mapWatchWorkoutToActivity(workout)).toMatchObject({ caloriesActive: 276 });
    expect(mapWatchWorkoutToActivity({ ...workout, caloriesActive: Number.NaN })).not.toHaveProperty('caloriesActive');
  });
});
