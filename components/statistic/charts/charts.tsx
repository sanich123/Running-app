import { View } from 'react-native';
import { useGetAnnualStatisticsByYearAndCategoryQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import { reduceMonthMetrics } from './reduce-month-metrics';
import LineChartWrapper from './line-chart-wrapper';

export default function Charts({ year, type }: { year: number; type: string }) {
  const { user } = useAuth();
  const { data: yearStats } = useGetAnnualStatisticsByYearAndCategoryQuery(
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
      style={{
        paddingVertical: 50,
        backgroundColor: '#414141',
      }}>
      {'totalDistanceArr' in reducedMetricsArr && <LineChartWrapper metricsArr={reducedMetricsArr?.totalDistanceArr} />}
      {'totalDurationArr' in reducedMetricsArr && <LineChartWrapper metricsArr={reducedMetricsArr?.totalDurationArr} />}
      {'totalMedianSpeedArr' in reducedMetricsArr && (
        <LineChartWrapper metricsArr={reducedMetricsArr?.totalMedianSpeedArr} />
      )}
      {'totalActivitiesArr' in reducedMetricsArr && (
        <LineChartWrapper metricsArr={reducedMetricsArr?.totalActivitiesArr} />
      )}
    </View>
  );
}
