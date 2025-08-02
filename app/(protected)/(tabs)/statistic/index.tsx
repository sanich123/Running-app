import { StyleSheet, View } from 'react-native';
import YearTypePicker from '@C/statistic/year-type-picker/year-type-picker';
import { useEffect, useState } from 'react';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import Charts from '@C/statistic/charts/charts';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useGetAnnualStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import ErrorComponent from '@C/error-component/error-component';
import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import MonthStatisticsMetrics from '@C/statistic/month-metric/month-metric';
import { MONTH_STATISTICS } from '@C/statistic/month-metric/const';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';

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
  } = useGetAnnualStatisticsByUserIdQuery({ userId }, { skip: !userId });
  const isRussian = language === LANGUAGES.russian;

  useEffect(() => {
    if (!yearStats?.[selectedYear]?.[selectedType]) {
      setSelectedType('all');
    }
  }, [selectedType, selectedYear, yearStats]);

  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled isError={isError} isLoading={isLoading}>
      {isLoading && <ActivityIndicator size="large" />}
      {isError && <ErrorComponent error={error} />}
      {isSuccess && yearStats?.isUserHasActivities && (
        <>
          <YearTypePicker
            setSelectedYear={setSelectedYear}
            setSelectedType={setSelectedType}
            selectedYear={selectedYear}
            selectedType={selectedType}
            availableYearsAndTypes={Object.keys(yearStats)
              .filter((year) => year !== 'isUserHasActivities')
              .map((year) => ({
                year,
                types: Object.keys(yearStats?.[year]),
              }))}
          />
          <View style={styles.metricsContainer}>
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].activities}
              metric={
                yearStats?.[selectedYear]?.[selectedType]?.totalItems || yearStats?.[selectedYear]['all'].totalItems
              }
              postfix={''}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
            />
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].distance}
              metric={`${Math.round(yearStats?.[selectedYear]?.[selectedType]?.totalDistance || yearStats?.[selectedYear]['all'].totalDistance)}`}
              postfix={`${isRussian ? 'км' : 'km'}`}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
            />
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].duration}
              metric={`${Math.round(yearStats?.[selectedYear]?.[selectedType]?.totalDuration || yearStats?.[selectedYear]['all'].totalDuration)}`}
              postfix={`${isRussian ? 'ч' : 'h'}`}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
            />
          </View>
          <Charts
            year={selectedYear}
            months={yearStats?.[selectedYear]?.[selectedType] || yearStats?.[selectedYear]['all']}
          />
        </>
      )}
      {isSuccess && !yearStats?.isUserHasActivities && (
        <Text variant="titleLarge">{`${language === LANGUAGES.english ? 'There are no activities, so there are no statistics' : 'Если нет активностей - то нет и статистики :('}`}</Text>
      )}
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
