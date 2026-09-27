import { buildDashboardYears } from './data';
import type { YearStatisticsResponse } from '@R/runich-api/types';

describe('statistics dashboard data', () => {
  it('keeps server years and unknown sports instead of limiting the UI to local sport buttons', () => {
    const statistics = {
      isUserHasActivities: true,
      '2020': {
        all: {
          totalDistance: 120,
          totalDuration: 12,
          totalItems: 4,
          '0': { totalDistance: 80, totalDuration: 8, totalItems: 3 },
          '1': { totalDistance: 40, totalDuration: 4, totalItems: 1 },
        },
        Yoga: {
          totalDistance: 0,
          totalDuration: 2,
          totalItems: 1,
          '0': { totalDistance: 0, totalDuration: 2, totalItems: 1 },
        },
      },
    } as unknown as YearStatisticsResponse;

    const years = buildDashboardYears(statistics);

    expect(years[2020].sports.Yoga.activities).toBe(1);
    expect(years[2020].monthly.distance).toEqual([80, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(years[2020].bestMonth).toBe(0);
  });

  it('keeps backend daily activity groups and unknown sports for the heatmap', () => {
    const statistics = {
      isUserHasActivities: true,
      '2020': {
        all: { totalDistance: 5, totalDuration: 1, totalItems: 2 },
        Yoga: { totalDistance: 0, totalDuration: 0.3, totalItems: 1 },
        dailyActivities: {
          '2020-06-15': [
            { sport: 'run', distance: 5000, duration: 1_800_000, date: '2020-06-15T08:00:00.000Z' },
            { sport: 'Yoga', distance: 0, duration: 1_200_000, date: '2020-06-15T10:00:00.000Z' },
          ],
        },
      },
    } as unknown as YearStatisticsResponse;

    const years = buildDashboardYears(statistics);

    expect(years[2020].dailyActivities['2020-06-15']).toHaveLength(2);
    expect(years[2020].sports).not.toHaveProperty('dailyActivities');
  });
});
