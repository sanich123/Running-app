import { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import BarChartWrapper from './bar-chart-wrapper';
import ChooseMetricsBtns from './choose-metrics-btns';
import { reduceMonthMetrics } from './reduce-month-metrics';
import { ChooseMetricsBtnsValues } from './types';
import type { MonthMetrics } from './types';

export default function Charts({ year, months }: { year: number; months: MonthMetrics }) {
  const { colors } = useTheme();
  const [chartValue, setChartValue] = useState<ChooseMetricsBtnsValues>(ChooseMetricsBtnsValues.distance);
  const { language } = useAppSelector(({ language }) => language);
  const chartToRender = reduceMonthMetrics(months, language);

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
