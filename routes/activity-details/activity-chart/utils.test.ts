import { LANGUAGES } from '@const/enums';
import {
  buildActivityChartSeries,
  buildHeartRateZoneDistribution,
  formatActivityChartAxisValue,
  formatHeartRateZoneDuration,
  formatHeartRateZoneRange,
  getActivityChartAxisTicks,
  getActivityChartYCoordinate,
  getDefaultActivityChartAxes,
  getHeartRateZone,
  getHeartRateZoneSettings,
} from './utils';
import type { ActivityChartSeries } from './types';
import type { ActivityChartDataResponse } from '@R/runich-api/types';

const activityZoneSettings = { basis: 'activityMaximum' as const, maximumHeartRate: 150 };

describe('heart rate chart utilities', () => {
  it('assigns heart-rate values to zones using 60, 70, 80, and 90 percent thresholds', () => {
    expect(getHeartRateZone(89, activityZoneSettings)).toBe(1);
    expect(getHeartRateZone(90, activityZoneSettings)).toBe(2);
    expect(getHeartRateZone(105, activityZoneSettings)).toBe(3);
    expect(getHeartRateZone(120, activityZoneSettings)).toBe(4);
    expect(getHeartRateZone(135, activityZoneSettings)).toBe(5);
  });

  it('formats zone bpm ranges from the maximum heart rate', () => {
    expect(
      [1, 2, 3, 4, 5].map((zone) => formatHeartRateZoneRange(zone as 1 | 2 | 3 | 4 | 5, activityZoneSettings)),
    ).toEqual(['≤ 89', '90–104', '105–119', '120–134', '≥ 135']);
    expect(formatHeartRateZoneRange(1, { ...activityZoneSettings, maximumHeartRate: 0 })).toBe('—');
  });

  it('uses profile resting and maximum heart rate, then age, then workout maximum', () => {
    expect(
      getHeartRateZoneSettings({
        activityMaximumHeartRate: 160,
        profileAge: '40',
        profileRestingHeartRate: '55',
        profileMaximumHeartRate: '190',
      }),
    ).toEqual({ basis: 'heartRateReserve', maximumHeartRate: 190, restingHeartRate: 55 });
    expect(
      getHeartRateZoneSettings({
        activityMaximumHeartRate: 160,
        profileAge: '40',
        profileRestingHeartRate: '55',
      }),
    ).toEqual({ basis: 'age', maximumHeartRate: 180 });
    expect(
      getHeartRateZoneSettings({
        activityMaximumHeartRate: 160,
        profileAge: 'not set',
      }),
    ).toEqual({ basis: 'activityMaximum', maximumHeartRate: 160 });
  });

  it('uses heart-rate reserve to calculate zones and bpm ranges', () => {
    const settings = { basis: 'heartRateReserve' as const, maximumHeartRate: 190, restingHeartRate: 55 };

    expect(getHeartRateZone(55, settings)).toBe(1);
    expect(getHeartRateZone(136, settings)).toBe(2);
    expect(getHeartRateZone(150, settings)).toBe(3);
    expect(formatHeartRateZoneRange(1, settings)).toBe('≤ 135');
    expect(formatHeartRateZoneRange(2, settings)).toBe('136–149');
    expect(formatHeartRateZoneRange(5, settings)).toBe('≥ 177');
  });

  it('shows time and percentage spent in each heart-rate zone', () => {
    const series: ActivityChartSeries = {
      metric: 'heartRate',
      minValue: 80,
      maxValue: 150,
      data: [
        { originalValue: 80, elapsedMilliseconds: 0 },
        { originalValue: 100, elapsedMilliseconds: 30_000 },
        { originalValue: 150, elapsedMilliseconds: 90_000 },
      ],
    };

    const zones = buildHeartRateZoneDistribution(series, activityZoneSettings);

    expect(zones.map(({ percentage }) => percentage)).toEqual([0, 33, 0, 67, 0]);
    expect(zones.reduce((total, { percentage }) => total + percentage, 0)).toBe(100);
    expect(zones.map(({ duration }) => duration)).toEqual([0, 30_000, 0, 60_000, 0]);
    expect(formatHeartRateZoneDuration(zones[1].duration)).toBe('00:30');
  });

  it('orders left and right axis ticks in the direction their metrics are drawn', () => {
    const heartRateSeries: ActivityChartSeries = {
      metric: 'heartRate',
      minValue: 80,
      maxValue: 120,
      data: [],
    };
    const paceSeries: ActivityChartSeries = { ...heartRateSeries, metric: 'pace', minValue: 5, maxValue: 9 };
    const speedSeries: ActivityChartSeries = { ...heartRateSeries, metric: 'speed', minValue: 3, maxValue: 7 };

    const elevationSeries: ActivityChartSeries = {
      ...heartRateSeries,
      metric: 'elevation',
      minValue: 100,
      maxValue: 200,
    };

    expect(getActivityChartAxisTicks(heartRateSeries, 'heartRate')).toEqual([120, 110, 100, 90, 80]);
    expect(getActivityChartAxisTicks(paceSeries, 'pace')).toEqual([5, 6, 7, 8, 9]);
    expect(getActivityChartAxisTicks(speedSeries, 'speed')).toEqual([7, 6, 5, 4, 3]);
    expect(getActivityChartAxisTicks(elevationSeries, 'elevation')).toEqual([200, 175, 150, 125, 100]);
    expect(getActivityChartYCoordinate(5, 'pace', 5, 9, 10, 100)).toBe(10);
    expect(getActivityChartYCoordinate(5, 'speed', 3, 7, 10, 100)).toBe(60);
    expect(getActivityChartYCoordinate(200, 'elevation', 100, 200, 10, 100)).toBe(10);
  });

  it('formats pace, speed, and localized bpm axis values', () => {
    expect(formatActivityChartAxisValue('heartRate', 87.6, LANGUAGES.russian)).toBe('88');
    expect(formatActivityChartAxisValue('pace', 320, LANGUAGES.english)).toBe("5'20");
    expect(formatActivityChartAxisValue('speed', 8.65, LANGUAGES.english)).toBe('8.7');
    expect(formatActivityChartAxisValue('speed', 8.65, LANGUAGES.russian)).toBe('8,7');
    expect(formatActivityChartAxisValue('elevation', 42.4, LANGUAGES.english)).toBe('42.4');
  });

  it('builds pace and elevation series even when heart rate was not recorded', () => {
    const chartData: ActivityChartDataResponse = {
      heartRateSamples: [],
      locations: [
        { coords: { latitude: 0, longitude: 0, altitude: 100, timestamp: 1_000 } },
        { coords: { latitude: 0, longitude: 0.005, altitude: 110, timestamp: 121_000 } },
        { coords: { latitude: 0, longitude: 0.01, altitude: 120, timestamp: 241_000 } },
      ],
    };

    const series = buildActivityChartSeries(chartData, 'run', 1_112);

    expect(series.map(({ metric }) => metric)).toEqual(['pace', 'elevation']);
    expect(series.find(({ metric }) => metric === 'elevation')).toMatchObject({ minValue: 100, maxValue: 120 });
    expect(getDefaultActivityChartAxes(series)).toEqual({ leftMetric: 'pace', rightMetric: 'elevation' });
  });

  it('ignores near-stationary GPS segments so they do not flatten running pace on the graph', () => {
    const chartData: ActivityChartDataResponse = {
      heartRateSamples: [],
      locations: [
        { coords: { latitude: 0, longitude: 0, altitude: 100, timestamp: 1_000 } },
        { coords: { latitude: 0, longitude: 0.0001, altitude: 100, timestamp: 121_000 } },
        { coords: { latitude: 0, longitude: 0.005, altitude: 101, timestamp: 241_000 } },
        { coords: { latitude: 0, longitude: 0.01, altitude: 102, timestamp: 361_000 } },
      ],
    };

    const paceSeries = buildActivityChartSeries(chartData, 'run', 1_112).find(({ metric }) => metric === 'pace');

    expect(paceSeries?.maxValue).toBeLessThanOrEqual(40 * 60);
  });
});
