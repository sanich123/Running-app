import ChartValueLabel from './label';

type MonthMetrics = {
  [key: string]: { totalDistance: number; totalDuration: number; medianSpeed: number; items: number };
};

export function reduceMonthMetrics(monthMetrics: MonthMetrics[]) {
  if (monthMetrics?.length > 0) {
    const { totalDurationArr, totalDistanceArr, totalMedianSpeedArr, totalActivitiesArr } = monthMetrics?.reduce(
      (
        acc: {
          totalDurationArr: { value: number; labelComponent: () => void }[];
          totalDistanceArr: { value: number; labelComponent: () => void }[];
          totalMedianSpeedArr: { value: number; labelComponent: () => void }[];
          totalActivitiesArr: { value: number; labelComponent: () => void }[];
        },
        monthStatsObj: MonthMetrics,
        i: number,
      ) => {
        acc.totalDurationArr.push({
          value: monthStatsObj[i].totalDuration ? monthStatsObj[i].totalDuration : 0,
          labelComponent: () => ChartValueLabel(`${i + 1}`),
        });
        acc.totalDistanceArr.push({
          value: monthStatsObj[i].totalDistance ? monthStatsObj[i].totalDistance : 0,
          labelComponent: () => ChartValueLabel(`${i + 1}`),
        });
        acc.totalMedianSpeedArr.push({
          value: monthStatsObj[i].medianSpeed ? monthStatsObj[i].medianSpeed : 0,
          labelComponent: () => ChartValueLabel(`${i + 1}`),
        });
        acc.totalActivitiesArr.push({
          value: monthStatsObj[i].items ? monthStatsObj[i].items : 0,
          labelComponent: () => ChartValueLabel(`${i + 1}`),
        });
        return acc;
      },
      { totalDurationArr: [], totalDistanceArr: [], totalMedianSpeedArr: [], totalActivitiesArr: [] },
    );
    return { totalDurationArr, totalDistanceArr, totalMedianSpeedArr, totalActivitiesArr };
  }
  return {};
}
