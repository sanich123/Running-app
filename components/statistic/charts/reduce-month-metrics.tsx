import { AccumulatorValues, MonthMetrics } from './types';
import { getMathRoundValueOrZero, mapNumberToMonth } from './util';
import { Text } from 'react-native-paper';

export function reduceMonthMetrics(monthMetrics: MonthMetrics[]) {
  if (monthMetrics?.length > 0) {
    const { totalDurationArr, totalDistanceArr, totalMedianSpeedArr, totalActivitiesArr } = monthMetrics?.reduce(
      (acc: AccumulatorValues, monthStatsObj: MonthMetrics, i: number) => {
        const durationValue = getMathRoundValueOrZero(monthStatsObj[i].totalDuration);
        const distanceValue = getMathRoundValueOrZero(monthStatsObj[i].totalDistance);
        const speedValue = getMathRoundValueOrZero(monthStatsObj[i].medianSpeed);
        const itemsValue = getMathRoundValueOrZero(monthStatsObj[i].items);
        acc.totalDurationArr.push({
          value: durationValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 10 }}>
              {durationValue || ''}
            </Text>
          ),
        });
        acc.totalDistanceArr.push({
          value: distanceValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 10 }}>
              {distanceValue || ''}
            </Text>
          ),
        });
        acc.totalMedianSpeedArr.push({
          value: speedValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 10 }}>
              {speedValue || ''}
            </Text>
          ),
        });
        acc.totalActivitiesArr.push({
          value: itemsValue,
          label: mapNumberToMonth(i),
          topLabelComponent: () => (
            <Text variant="bodySmall" style={{ fontSize: 12 }}>
              {itemsValue || ''}
            </Text>
          ),
        });
        return acc;
      },
      { totalDurationArr: [], totalDistanceArr: [], totalMedianSpeedArr: [], totalActivitiesArr: [] },
    );
    return { totalDurationArr, totalDistanceArr, totalMedianSpeedArr, totalActivitiesArr };
  }
}
