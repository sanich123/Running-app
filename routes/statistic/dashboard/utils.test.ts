import { LANGUAGES } from '@const/enums';
import {
  buildHeatmapColumns,
  formatChartAxisValue,
  formatDayActivityValue,
  formatLongDate,
  formatMetricNumber,
  formatMetricValue,
  getAnnualChartScale,
  getDateKey,
  getDayIntensity,
  getHeatmapColor,
  getHeatmapMonthSpans,
  getSportLabel,
  groupActivitiesBySport,
  parseDateKey,
  withAlpha,
} from './utils';
import type { DashboardDailyActivities, DashboardLabels, DashboardThemeColors } from './types';

const labels: DashboardLabels = {
  yearActivity: 'Year activity',
  byMonths: 'By months',
  yearAverage: 'Year average',
  chartHint: 'Tap a month',
  byWorkouts: 'By workouts',
  distance: 'Distance',
  duration: 'Duration',
  activities: 'Workouts',
  activeDays: 'Active days',
  peakMonth: 'Peak month',
  sportDistribution: 'Sports',
  allSports: 'All sports',
  heatmapHint: 'Select a day',
  selectedDay: 'Selected day',
  openMonth: 'Open month',
  selectedMonth: 'Selected month',
  noActivity: 'No activity',
  run: 'Run',
  bike: 'Ride',
  walk: 'Walk',
  workout: 'Workout',
  hours: 'h',
  minutes: 'min',
  kilometres: 'km',
};

describe('dashboard heatmap layout', () => {
  it('starts weeks on Monday and keeps every date under its real week', () => {
    const columns = buildHeatmapColumns(2026, 'all', 'activities', {});

    expect(columns[0].map(({ date }) => getDateKey(date))).toEqual([
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
    ]);
    expect(columns[0][3].isOutsideYear).toBe(false);
    expect(columns[0][0].isOutsideYear).toBe(true);
    expect(getDateKey(columns.at(-1)?.[6].date ?? new Date(0))).toBe('2027-01-03');
  });

  it('sizes month labels by the actual number of calendar weeks', () => {
    const columns = buildHeatmapColumns(2026, 'all', 'activities', {});
    const monthSpans = getHeatmapMonthSpans(
      2026,
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      columns,
    );

    expect(monthSpans).toHaveLength(12);
    expect(monthSpans.reduce((sum, { columnSpan }) => sum + columnSpan, 0)).toBe(columns.length);
    expect(monthSpans[5].columnSpan).toBeGreaterThan(0);
    expect(monthSpans[6].columnSpan).toBeGreaterThan(0);
  });

  it('formats metric values and chart axis labels by metric', () => {
    expect(formatMetricNumber(3.6, 'activities')).toBe(4);
    expect(formatMetricNumber(3.64, 'distance')).toBe(3.6);
    expect(formatMetricValue(2.25, 'distance', labels)).toBe('2.3 km');
    expect(formatMetricValue(1.25, 'duration', labels)).toBe('1.3 h');
    expect(formatMetricValue(2.4, 'activities', labels)).toBe('2');
    expect(formatChartAxisValue('2.7', 'activities')).toBe('3');
    expect(formatChartAxisValue('2.75', 'distance')).toBe('2.8');
    expect(formatChartAxisValue('unknown', 'distance')).toBe('unknown');
  });

  it('scales activity counts and non-activity metrics to readable chart steps', () => {
    expect(getAnnualChartScale([], 'activities')).toEqual({ average: 0, maxValue: 4, noOfSections: 4, stepValue: 1 });
    expect(getAnnualChartScale([4, Number.NaN, -3], 'activities')).toEqual({
      average: 1.3333333333333333,
      maxValue: 5,
      noOfSections: 5,
      stepValue: 1,
    });
    expect(getAnnualChartScale([8], 'distance').stepValue).toBe(2);
    expect(getAnnualChartScale([10], 'distance').stepValue).toBe(2.5);
    expect(getAnnualChartScale([20], 'distance').stepValue).toBe(5);
    expect(getAnnualChartScale([32], 'distance').stepValue).toBe(10);
    expect(getAnnualChartScale([4], 'duration')).toMatchObject({ maxValue: 5, noOfSections: 5 });
  });

  it('maps common sport names and leaves unknown labels readable', () => {
    expect(getSportLabel('trail-run', labels, LANGUAGES.english)).toBe('Run');
    expect(getSportLabel('virtual_ride', labels, LANGUAGES.english)).toBe('Ride');
    expect(getSportLabel('walking', labels, LANGUAGES.russian)).toBe('Walk');
    expect(getSportLabel('HIKE', labels, LANGUAGES.russian)).toBe('Хайкинг');
    expect(getSportLabel('hiking', labels, LANGUAGES.english)).toBe('Hiking');
    expect(getSportLabel('weight-training', labels, LANGUAGES.english)).toBe('Workout');
    expect(getSportLabel('road_skating', labels, LANGUAGES.english)).toBe('road skating');
  });

  it('calculates activity, distance, and duration heatmap intensity with sport filters', () => {
    const date = new Date(2026, 0, 5);
    const key = getDateKey(date);
    const dailyActivities: DashboardDailyActivities = {
      [key]: [
        { date: '', sport: 'run', distance: 2_000, duration: 900_000 },
        { date: '', sport: 'bike', distance: 4_000, duration: 2_700_000 },
      ],
    };

    expect(getDayIntensity(date, 'all', 'activities', dailyActivities)).toBe(2);
    expect(getDayIntensity(date, 'run', 'activities', dailyActivities)).toBe(1);
    expect(getDayIntensity(date, 'walk', 'activities', dailyActivities)).toBe(0);
    expect(getDayIntensity(date, 'all', 'distance', dailyActivities)).toBe(2);
    expect(getDayIntensity(date, 'run', 'distance', dailyActivities)).toBe(1);
    expect(getDayIntensity(date, 'all', 'duration', dailyActivities)).toBe(3);

    const activityData = (metric: 'distance' | 'duration', value: number) => ({
      [key]: [
        {
          date: '',
          sport: 'run',
          distance: metric === 'distance' ? value : 0,
          duration: metric === 'duration' ? value : 0,
        },
      ],
    });
    expect(getDayIntensity(date, 'run', 'distance', activityData('distance', 8_000))).toBe(3);
    expect(getDayIntensity(date, 'run', 'distance', activityData('distance', 15_000))).toBe(4);
    expect(getDayIntensity(date, 'run', 'distance', activityData('distance', 16_000))).toBe(4);
    expect(getDayIntensity(date, 'run', 'duration', activityData('duration', 900_000))).toBe(1);
    expect(getDayIntensity(date, 'run', 'duration', activityData('duration', 2_700_000))).toBe(2);
    expect(getDayIntensity(date, 'run', 'duration', activityData('duration', 3_600_000))).toBe(3);
    expect(getDayIntensity(date, 'run', 'duration', activityData('duration', 7_200_000))).toBe(4);
  });

  it('formats grouped activity summaries for every metric', () => {
    const grouped = groupActivitiesBySport([
      { date: '', sport: 'run', distance: 1_500, duration: 60_000 },
      { date: '', sport: 'run', distance: 2_500, duration: 120_000 },
      { date: '', sport: 'bike', distance: 10_000, duration: 600_000 },
    ]);

    expect(grouped).toEqual([
      { sport: 'run', distance: 4_000, duration: 180_000, activities: 2 },
      { sport: 'bike', distance: 10_000, duration: 600_000, activities: 1 },
    ]);
    expect(formatDayActivityValue(grouped[0], 'distance', labels)).toBe('4 km · 3 min');
    expect(formatDayActivityValue(grouped[0], 'duration', labels)).toBe('3 min · 4 km');
    expect(formatDayActivityValue(grouped[0], 'activities', labels)).toBe('2 workouts');
  });

  it('handles calendar span fallbacks, localized dates, and heatmap colors', () => {
    expect(getHeatmapMonthSpans(2026, ['Missing'], []).map(({ columnSpan }) => columnSpan)).toEqual([1]);
    expect(formatLongDate(new Date(2026, 0, 5), LANGUAGES.english)).toContain('January');
    expect(formatLongDate(new Date(2026, 0, 5), LANGUAGES.russian)).toContain('января');
    expect(parseDateKey('2026-08-04')).toEqual(new Date(2026, 7, 4));

    const themeColors = { primary: '#abc', surfaceVariant: '#eeeeee' } as DashboardThemeColors;
    expect(getHeatmapColor(0, themeColors)).toBe('#eeeeee');
    expect(getHeatmapColor(1, themeColors)).toBe('rgba(170,187,204, 0.32)');
    expect(withAlpha('#123456', 0.5)).toBe('rgba(18,52,86, 0.5)');
    expect(withAlpha('#12', 0.5)).toBe('#12');
    expect(withAlpha('transparent', 0.5)).toBe('transparent');
    expect(withAlpha('rgb(1, 2, 3)', 0.4)).toBe('rgba(1,2,3, 0.4)');
  });
});
