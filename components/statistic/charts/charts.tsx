import { View } from 'react-native';
import { useGetAnnualStatisticsByYearAndCategoryQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import { reduceMonthMetrics } from './reduce-month-metrics';
import BarChartWrapper from './bar-chart-wrapper';
import { ActivityIndicator, useTheme, Text } from 'react-native-paper';
import { useState } from 'react';
import { ChooseMetricsBtnsValues } from './types';
import ChooseMetricsBtns from './choose-metrics-btns';

export default function Charts({ year, type }: { year: number; type: string }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [chartValue, setChartValue] = useState<ChooseMetricsBtnsValues>(ChooseMetricsBtnsValues.distance);
  const {
    data: yearStats,
    isLoading,
    isError,
    isSuccess,
  } = useGetAnnualStatisticsByYearAndCategoryQuery(
    {
      userId: `${user?.id}`,
      year: `${year}`,
      category: type,
    },
    { skip: !user?.id },
  );
  console.log(yearStats);
  const reducedMetricsArr = reduceMonthMetrics(yearStats?.months);
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
  const isHasNoStatistics = !yearStats?.totalDistance || !yearStats?.totalDuration || !yearStats?.totalItems;
  return (
    <View
      style={[
        { backgroundColor: colors.background },
        (isLoading || isError) && { flex: 1, justifyContent: 'center', alignItems: 'center' },
      ]}>
      {isLoading && <ActivityIndicator size="large" />}
      {isSuccess && yearStats?.length ? (
        <BarChartWrapper
          metricsArr={chartToRender[chartValue]?.items}
          year={year}
          title={chartToRender[chartValue]?.title}
        />
      ) : (
        <View style={{ height: 273, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="headlineSmall">Пока еще нет никакой статистики</Text>
        </View>
      )}
      {isError && <Text variant="bodyMedium">Произошла ошибка во время получения данных</Text>}
      {isHasNoStatistics && <ChooseMetricsBtns chartValue={chartValue} setChartValue={setChartValue} />}
    </View>
  );
}
