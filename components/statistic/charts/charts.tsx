import { View } from 'react-native';
import { useGetAnnualStatisticsByYearAndCategoryQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import { reduceMonthMetrics } from './reduce-month-metrics';
import LineChartWrapper from './line-chart-wrapper';
import { useTheme } from 'react-native-paper';

export default function Charts({ year, type }: { year: number; type: string }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { data: yearStats } = useGetAnnualStatisticsByYearAndCategoryQuery(
    {
      userId: `${user?.id}`,
      year: `${year}`,
      category: type,
    },
    { skip: !user?.id },
  );
  console.log(yearStats);
  const reducedMetricsArr = reduceMonthMetrics(yearStats?.months);
  return (
    <View
      style={{
        paddingVertical: 50,
        backgroundColor: colors.background,
      }}>
      {'totalDistanceArr' in reducedMetricsArr && (
        <LineChartWrapper metricsArr={reducedMetricsArr?.totalDistanceArr} year={year} type={type} />
      )}
      {'totalDurationArr' in reducedMetricsArr && (
        <LineChartWrapper metricsArr={reducedMetricsArr?.totalDurationArr} year={year} type={type} />
      )}
      {'totalMedianSpeedArr' in reducedMetricsArr && (
        <LineChartWrapper metricsArr={reducedMetricsArr?.totalMedianSpeedArr} year={year} type={type} />
      )}
      {'totalActivitiesArr' in reducedMetricsArr && (
        <LineChartWrapper metricsArr={reducedMetricsArr?.totalActivitiesArr} year={year} type={type} />
      )}
    </View>
  );
}
