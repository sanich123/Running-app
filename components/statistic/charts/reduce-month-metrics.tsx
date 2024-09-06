import { mapNumberToMonth } from './util';
import { Text } from 'react-native-paper';

type MonthMetrics = {
  [key: string]: { totalDistance: number; totalDuration: number; medianSpeed: number; items: number };
};

type ChartBarComponent = {
  value: number;
  label: string;
  topLabelComponent: () => void;
};

type AccumulatorValues = {
  totalDurationArr: ChartBarComponent[];
  totalDistanceArr: ChartBarComponent[];
  totalMedianSpeedArr: ChartBarComponent[];
  totalActivitiesArr: ChartBarComponent[];
};

export function reduceMonthMetrics(monthMetrics: MonthMetrics[]) {
  if (monthMetrics?.length > 0) {
    const { totalDurationArr, totalDistanceArr, totalMedianSpeedArr, totalActivitiesArr } = monthMetrics?.reduce(
      (acc: AccumulatorValues, monthStatsObj: MonthMetrics, i: number) => {
        const durationValue = monthStatsObj[i].totalDuration ? Math.round(monthStatsObj[i].totalDuration) : 0;
        const distanceValue = monthStatsObj[i].totalDistance ? Math.round(monthStatsObj[i].totalDistance) : 0;
        const speedValue = monthStatsObj[i].medianSpeed ? Math.round(monthStatsObj[i].medianSpeed) : 0;
        const itemsValue = monthStatsObj[i].items ? Math.round(monthStatsObj[i].items) : 0;

        acc.totalDurationArr.push({
          value: durationValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 10 }}>
              {durationValue}
            </Text>
          ),
        });
        acc.totalDistanceArr.push({
          value: distanceValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 10 }}>
              {distanceValue}
            </Text>
          ),
        });
        acc.totalMedianSpeedArr.push({
          value: speedValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 10 }}>
              {speedValue}
            </Text>
          ),
        });
        acc.totalActivitiesArr.push({
          value: itemsValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 12 }}>
              {itemsValue}
            </Text>
          ),
        });
        return acc;
      },
      { totalDurationArr: [], totalDistanceArr: [], totalMedianSpeedArr: [], totalActivitiesArr: [] },
    );
    return { totalDurationArr, totalDistanceArr, totalMedianSpeedArr, totalActivitiesArr };
  }
  return {};
}
