import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import ErrorComponent from '@C/error-component/error-component';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';
import Charts from '@C/statistic/charts/charts';
import { MONTH_STATISTICS } from '@C/statistic/month-metric/const';
import MonthStatisticsMetrics from '@C/statistic/month-metric/month-metric';
import YearTypePicker from '@C/statistic/year-type-picker/year-type-picker';
import { LANGUAGES } from '@const/enums';
import { useGetAnnualStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';

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
            <YearTypePicker
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
                  <MonthStatisticsMetrics
                    title={MONTH_STATISTICS[language].activities}
                    metric={selectedStats.totalItems ?? 0}
                    postfix={''}
                    isSuccess={isSuccess}
                    isLoading={isLoading}
                    isError={isError}
                  />
                  <MonthStatisticsMetrics
                    title={MONTH_STATISTICS[language].distance}
                    metric={`${Math.round(selectedStats.totalDistance ?? 0)}`}
                    postfix={`${isRussian ? 'км' : 'km'}`}
                    isSuccess={isSuccess}
                    isLoading={isLoading}
                    isError={isError}
                  />
                  <MonthStatisticsMetrics
                    title={MONTH_STATISTICS[language].duration}
                    metric={`${Math.round(selectedStats.totalDuration ?? 0)}`}
                    postfix={`${isRussian ? 'ч' : 'h'}`}
                    isSuccess={isSuccess}
                    isLoading={isLoading}
                    isError={isError}
                  />
                </View>
                <Charts year={displayedYear} months={selectedStats} />
              </>
            )}
          </>
        ) : (
          <Text variant="titleLarge">{`${language === LANGUAGES.english ? 'There are no activities, so there are no statistics' : 'Если нет активностей - то нет и статистики :('}`}</Text>
        )
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
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
