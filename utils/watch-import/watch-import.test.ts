import { getWatchImportDateRange, mapWatchWorkoutToActivity } from './watch-import';

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
});
