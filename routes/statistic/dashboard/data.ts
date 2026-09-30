import type { DashboardDailyActivities, DashboardMetricTotals, DashboardYearData } from './types';
import type { DailyActivityStatisticsResponse, YearStatisticsResponse } from '@R/runich-api/types';

type StatisticsNode = Record<string, unknown>;

export function buildDashboardYears(statistics?: YearStatisticsResponse) {
  if (!statistics?.isUserHasActivities) return {};

  return Object.entries(statistics).reduce<Record<number, DashboardYearData>>((result, [key, value]) => {
    if (!/^\d{4}$/.test(key) || !isStatisticsNode(value)) return result;
    result[Number(key)] = buildDashboardYearData(value);
    return result;
  }, {});
}

function buildDashboardYearData(yearStatistics: StatisticsNode): DashboardYearData {
  const allStatistics = asStatisticsNode(yearStatistics.all) ?? {};
  const monthly = Array.from({ length: 12 }, (_, month) => getMetric(allStatistics[String(month)]));
  const sports = Object.entries(yearStatistics).reduce<Record<string, DashboardMetricTotals>>(
    (result, [key, value]) => {
      if (key !== 'all' && key !== 'dailyActivities' && isStatisticsNode(value)) result[key] = getMetric(value);
      return result;
    },
    {},
  );

  return {
    totals: getMetric(allStatistics),
    monthly: {
      distance: monthly.map(({ distance }) => distance),
      duration: monthly.map(({ duration }) => duration),
      activities: monthly.map(({ activities }) => activities),
      steps: monthly.map(({ steps }) => steps),
      caloriesActive: monthly.map(({ caloriesActive }) => caloriesActive),
    },
    sports,
    dailyActivities: parseDailyActivities(yearStatistics.dailyActivities),
    activeDays: 0,
    bestMonth: getBestMonth(monthly),
  };
}

function getMetric(value: unknown): DashboardMetricTotals {
  const node = asStatisticsNode(value);
  return {
    distance: getNumber(node?.totalDistance),
    duration: getNumber(node?.totalDuration),
    activities: getNumber(node?.totalItems),
    steps: getNumber(node?.totalSteps),
    caloriesActive: getNumber(node?.totalCaloriesActive),
  };
}

function getBestMonth(monthly: DashboardMetricTotals[]) {
  return monthly.reduce(
    (bestIndex, value, index, values) => (value.activities > values[bestIndex].activities ? index : bestIndex),
    0,
  );
}

function parseDailyActivities(value: unknown): DashboardDailyActivities {
  if (!isStatisticsNode(value)) return {};

  return Object.entries(value).reduce<DashboardDailyActivities>((result, [date, activities]) => {
    if (!Array.isArray(activities)) return result;
    result[date] = activities.flatMap((activity) => {
      if (!isDailyActivity(activity)) return [];
      return [
        {
          duration: activity.duration,
          distance: activity.distance,
          steps: getNumber(activity.steps),
          caloriesActive: getNumber(activity.caloriesActive),
          date: activity.date,
          sport: activity.sport,
        },
      ];
    });
    return result;
  }, {});
}

function isDailyActivity(value: unknown): value is DailyActivityStatisticsResponse {
  return (
    isStatisticsNode(value) &&
    typeof value.duration === 'number' &&
    typeof value.distance === 'number' &&
    typeof value.date === 'string' &&
    typeof value.sport === 'string'
  );
}

function getNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function isStatisticsNode(value: unknown): value is StatisticsNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asStatisticsNode(value: unknown) {
  return isStatisticsNode(value) ? value : null;
}
