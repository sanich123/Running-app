import { lazy, Suspense, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { useGetAnnualStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import { MONTH_STATISTICS } from '@S/month-metric/const';
import type { StatisticMetricResponse, YearCategoryStatistics } from '@R/runich-api/types';

const LazyCharts = lazy(() => import('@Routes/statistic/charts/charts'));
const LazyErrorComponent = lazy(() => import('@S/error-component/error-component'));
const LazyMonthStatisticsMetrics = lazy(() => import('@S/month-metric/month-metric'));
const LazyYearTypePicker = lazy(() => import('@Routes/statistic/year-type-picker/year-type-picker'));

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string>(SPORTS_BTNS_VALUES.run);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ language }) => language);
  const {
    data: yearStats,
    isLoading,
    isError,
    isSuccess,
    error,
    refetch,
  } = useGetAnnualStatisticsByUserIdQuery({ userId }, { skip: !userId });
  const isRussian = language === LANGUAGES.russian;
  type YearStatsByType = Record<string, YearCategoryStatistics>;
  const getYearStats = (year: string | number): YearStatsByType | undefined => {
    const value = yearStats?.[String(year)];
    return value && typeof value === 'object' ? value : undefined;
  };
  const availableYears = useMemo(
    () => (yearStats ? Object.keys(yearStats).filter((year) => year !== 'isUserHasActivities') : []),
    [yearStats],
  );
  const displayedYear = getYearStats(selectedYear) ? selectedYear : Number(availableYears[0]);
  const selectedYearStats = getYearStats(displayedYear) ?? getYearStats(availableYears[0]);
  const displayedType = selectedYearStats?.[selectedType] ? selectedType : 'all';
  const selectedStats = selectedYearStats?.[displayedType];
  const chartStats = selectedStats
    ? (Object.fromEntries(Object.entries(selectedStats).filter(([, value]) => typeof value === 'object')) as Record<
        string,
        StatisticMetricResponse
      >)
    : {};

  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled isError={isError} isLoading={isLoading}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : isSuccess ? (
        yearStats?.isUserHasActivities ? (
          <>
            <Suspense fallback={<ActivityIndicator size="large" />}>
              <LazyYearTypePicker
                setSelectedYear={setSelectedYear}
                setSelectedType={setSelectedType}
                selectedYear={displayedYear}
                selectedType={displayedType}
                availableYearsAndTypes={availableYears.map((year) => ({
                  year,
                  types: Object.keys(getYearStats(year) ?? {}).filter((type) => {
                    const stats = getYearStats(year);
                    return stats?.[type] && typeof stats[type] === 'object';
                  }),
                }))}
              />
              {selectedStats && (
                <>
                  <View style={styles.metricsContainer}>
                    <LazyMonthStatisticsMetrics
                      title={MONTH_STATISTICS[language].activities}
                      metric={selectedStats.totalItems ?? 0}
                      postfix={''}
                      isSuccess={isSuccess}
                      isLoading={isLoading}
                      isError={isError}
                    />
                    <LazyMonthStatisticsMetrics
                      title={MONTH_STATISTICS[language].distance}
                      metric={`${Math.round(selectedStats.totalDistance ?? 0)}`}
                      postfix={`${isRussian ? 'км' : 'km'}`}
                      isSuccess={isSuccess}
                      isLoading={isLoading}
                      isError={isError}
                    />
                    <LazyMonthStatisticsMetrics
                      title={MONTH_STATISTICS[language].duration}
                      metric={`${Math.round(selectedStats.totalDuration ?? 0)}`}
                      postfix={`${isRussian ? 'ч' : 'h'}`}
                      isSuccess={isSuccess}
                      isLoading={isLoading}
                      isError={isError}
                    />
                  </View>
                  <LazyCharts year={displayedYear} months={chartStats} />
                </>
              )}
            </Suspense>
          </>
        ) : (
          <EmptyState
            icon="chart-line-variant"
            title={EMPTY_STATE_COPY[language].activities.title}
            message={
              isRussian
                ? 'Добавьте первую активность, и здесь появятся ваши показатели.'
                : 'Add your first activity to see your progress here.'
            }
          />
        )
      ) : isError ? (
        <Suspense fallback={<ActivityIndicator size="large" />}>
          <LazyErrorComponent error={error} refetch={refetch} />
        </Suspense>
      ) : null}
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  metricsContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  isInCenter: { alignItems: 'center', justifyContent: 'center' },
});
