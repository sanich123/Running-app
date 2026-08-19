import { createElement } from 'react';
import { Text } from 'react-native-paper';
import { METRICS_TITLES } from './const';
import { getMathRoundValueOrZero, mapNumberToMonth } from './util';
import type { AccumulatorValues, MonthMetrics } from './types';
import type { LANGUAGES } from '@const/enums';

export function reduceMonthMetrics(monthMetrics: MonthMetrics, language: LANGUAGES) {
  const { totalDuration, totalDistance, totalActivities } = [...Array(12).keys()].reduce(
    (acc: AccumulatorValues, index: number) => {
      let durationValue, distanceValue, itemsValue;
      if (monthMetrics[index]) {
        durationValue = getMathRoundValueOrZero(monthMetrics[index].totalDuration);
        distanceValue = getMathRoundValueOrZero(monthMetrics[index].totalDistance);
        itemsValue = getMathRoundValueOrZero(monthMetrics[index].totalItems);
      } else {
        durationValue = 0;
        distanceValue = 0;
        itemsValue = 0;
      }
      acc.totalDuration.push(prepareValuesToCharts(durationValue, language, index));
      acc.totalDistance.push(prepareValuesToCharts(distanceValue, language, index));
      acc.totalActivities.push(prepareValuesToCharts(itemsValue, language, index));
      return acc;
    },
    { totalDuration: [], totalDistance: [], totalActivities: [] },
  );
  return {
    distance: {
      title: METRICS_TITLES[language].distance,
      items: totalDistance,
    },
    amount: {
      title: METRICS_TITLES[language].activities,
      items: totalActivities,
    },
    duration: {
      title: METRICS_TITLES[language].duration,
      items: totalDuration,
    },
  };
}

function prepareValuesToCharts(value: number, language: LANGUAGES, index: number) {
  return {
    value,
    label: mapNumberToMonth(index, language),
    topLabelComponent: () =>
      createElement(Text, { variant: 'bodySmall', style: { fontSize: 12, fontWeight: 'bold' }, children: value || '' }),
  };
}
