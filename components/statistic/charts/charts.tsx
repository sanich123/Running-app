import { View } from 'react-native';
import { useGetAnnualStatisticsByYearAndCategoryQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import { reduceMonthMetrics } from './reduce-month-metrics';
import LineChartWrapper from './line-chart-wrapper';
import { ActivityIndicator, Divider, useTheme, Text } from 'react-native-paper';

export default function Charts({ year, type }: { year: number; type: string }) {
  const { user } = useAuth();
  const { colors } = useTheme();
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
  const reducedMetricsArr = reduceMonthMetrics(yearStats?.months);

  return (
    <View
      style={[
        { backgroundColor: colors.background },
        (isLoading || isError) && { flex: 1, justifyContent: 'center', alignItems: 'center' },
      ]}>
      {isLoading && <ActivityIndicator size="large" />}
      {isSuccess && (
        <>
          <LineChartWrapper
            metricsArr={reducedMetricsArr?.totalDistanceArr}
            year={year}
            type={type}
            title={'Километры'}
          />
          <Divider bold />
          <LineChartWrapper metricsArr={reducedMetricsArr?.totalDurationArr} year={year} type={type} title={'Часы'} />
          <Divider bold />
          <LineChartWrapper
            metricsArr={reducedMetricsArr?.totalMedianSpeedArr}
            year={year}
            type={type}
            title={'Скорость'}
          />
          <Divider bold />
          <LineChartWrapper
            metricsArr={reducedMetricsArr?.totalActivitiesArr}
            year={year}
            type={type}
            title={'Количество тренировок'}
          />
          <Divider bold />
        </>
      )}
      {isError && <Text variant="bodyMedium">Произошла ошибка во время получения данных</Text>}
    </View>
  );
}
