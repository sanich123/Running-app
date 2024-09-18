import { LANGUAGES } from '@const/enums';
import { AccumulatorValues, MonthMetrics } from './types';
import { getMathRoundValueOrZero, mapNumberToMonth } from './util';
import { Text } from 'react-native-paper';
import { METRICS_TITLES } from './const';

export function reduceMonthMetrics(monthMetrics: MonthMetrics[], language: LANGUAGES) {
  const { totalDurationArr, totalDistanceArr, totalActivitiesArr } = monthMetrics?.reduce(
    (acc: AccumulatorValues, monthStatsObj: MonthMetrics, i: number) => {
      const durationValue = getMathRoundValueOrZero(monthStatsObj[i].totalDuration);
      const distanceValue = getMathRoundValueOrZero(monthStatsObj[i].totalDistance);

      const itemsValue = getMathRoundValueOrZero(monthStatsObj[i].items);
      acc.totalDurationArr.push(prepareValuesToCharts(durationValue, language, i));
      acc.totalDistanceArr.push(prepareValuesToCharts(distanceValue, language, i));
      acc.totalActivitiesArr.push(prepareValuesToCharts(itemsValue, language, i));
      return acc;
    },
    { totalDurationArr: [], totalDistanceArr: [], totalMedianSpeedArr: [], totalActivitiesArr: [] },
  );
  return {
    distance: {
      title: METRICS_TITLES[language].distance,
      items: totalDistanceArr,
    },
    amount: {
      title: METRICS_TITLES[language].activities,
      items: totalActivitiesArr,
    },
    duration: {
      title: METRICS_TITLES[language].duration,
      items: totalDurationArr,
    },
  };
}

function prepareValuesToCharts(value: number, language: LANGUAGES, i: number) {
  return {
    value,
    label: mapNumberToMonth(i, language),
    topLabelComponent: () => (
      <Text variant="bodySmall" style={{ fontSize: 12, fontWeight: 'bold' }}>
        {value || ''}
      </Text>
    ),
  };
}
