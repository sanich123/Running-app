import { View } from 'react-native';
import { reduceMonthMetrics } from './reduce-month-metrics';
import BarChartWrapper from './bar-chart-wrapper';
import { useTheme } from 'react-native-paper';
import { useState } from 'react';
import { ChooseMetricsBtnsValues, MonthMetrics } from './types';
import ChooseMetricsBtns from './choose-metrics-btns';

export default function Charts({ year, months }: { year: number; months: MonthMetrics[] }) {
  const { colors } = useTheme();
  const [chartValue, setChartValue] = useState<ChooseMetricsBtnsValues>(ChooseMetricsBtnsValues.distance);

  const reducedMetricsArr = reduceMonthMetrics(months);
  const chartToRender = {
    distance: {
      title: 'Километры',
      items: reducedMetricsArr?.totalDistanceArr,
    },
    amount: {
      title: 'Тренировки',
      items: reducedMetricsArr?.totalActivitiesArr,
    },
    duration: {
      title: 'Время',
      items: reducedMetricsArr?.totalDurationArr,
    },
  };

  return (
    <View style={[{ backgroundColor: colors.background }]}>
      <BarChartWrapper
        metricsArr={chartToRender[chartValue]?.items}
        year={year}
        title={chartToRender[chartValue]?.title}
      />
      <ChooseMetricsBtns chartValue={chartValue} setChartValue={setChartValue} />
    </View>
  );
}
