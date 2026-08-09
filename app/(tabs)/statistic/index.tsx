import { lazy, Suspense, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useGetAnnualStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import { SPORTS_BTNS_VALUES } from '@Routes/save-activity-page/sports-btns/const';
import { MONTH_STATISTICS } from '@Routes/statistic/month-metric/const';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';

const LazyCharts = lazy(() => import('@Routes/statistic/charts/charts'));
const LazyErrorComponent = lazy(() => import('@Routes/error-component/error-component'));
const LazyMonthStatisticsMetrics = lazy(() => import('@Routes/statistic/month-metric/month-metric'));
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
  const availableYears = useMemo(
    () => (yearStats ? Object.keys(yearStats).filter((year) => year !== 'isUserHasActivities') : []),
    [yearStats],
  );
  const displayedYear = yearStats?.[selectedYear] ? selectedYear : Number(availableYears[0]);
  const selectedYearStats = yearStats?.[displayedYear] ?? yearStats?.[availableYears[0]];
  const displayedType = selectedYearStats?.[selectedType] ? selectedType : 'all';
  const selectedStats = selectedYearStats?.[displayedType];

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
                  types: Object.keys(yearStats[year]),
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
                  <LazyCharts year={displayedYear} months={selectedStats} />
                </>
              )}
            </Suspense>
          </>
        ) : (
          <Text variant="titleLarge">{`${language === LANGUAGES.english ? 'There are no activities, so there are no statistics' : 'Если нет активностей - то нет и статистики :('}`}</Text>
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
