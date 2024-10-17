import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import YearTypePicker from '@C/statistic/year-type-picker/year-type-picker';
import { useEffect, useState } from 'react';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import Charts from '@C/statistic/charts/charts';
import { ActivityIndicator, useTheme, Text } from 'react-native-paper';
import { useGetAnnualStatisticsByUserIdQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';

import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import MonthStatisticsMetrics from '@C/statistic/month-metric/month-metric';
import { MONTH_STATISTICS } from '@C/statistic/month-metric/const';
import { MAX_MOBILE_WIDTH } from '@const/const';

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string>(SPORTS_BTNS_VALUES.run);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const {
    data: yearStats,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useGetAnnualStatisticsByUserIdQuery({ userId: `${user?.id}` }, { skip: !user?.id });
  const isRussian = language === LANGUAGES.russian;

  useEffect(() => {
    if (!yearStats?.[selectedYear]?.[selectedType]) {
      setSelectedType('all');
    }
  }, [selectedType, selectedYear, yearStats]);

  return (
    <ScrollView
      contentContainerStyle={[
        (isLoading || isError || !yearStats?.isUserHasActivities) && {
          ...styles.isInCenter,
          backgroundColor: colors.background,
        },
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      <View style={{ backgroundColor: colors.background }}>
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
      </View>
    </ScrollView>
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
  isInCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
