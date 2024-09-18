import { ScrollView, StyleSheet, View } from 'react-native';
import YearTypePicker from '@C/statistic/year-type-picker/year-type-picker';
import { useState } from 'react';
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

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string>(SPORTS_BTNS_VALUES.run);
  const { user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const {
    data: yearStats,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useGetAnnualStatisticsByUserIdQuery({ userId: `${user?.id}` }, { skip: !user?.id });
  const isUserHasActivities = yearStats && selectedYear in yearStats;
  const isRussian = language === LANGUAGES.russian;

  return (
    <ScrollView
      contentContainerStyle={[
        (isLoading || isError || !isUserHasActivities) && {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        },
      ]}>
      <View style={{ backgroundColor: colors.background }}>
        {isLoading && <ActivityIndicator size="large" />}
        {isError && <ErrorComponent error={error} />}
        {isSuccess && isUserHasActivities && (
          <>
            <YearTypePicker
              setSelectedYear={setSelectedYear}
              setSelectedType={setSelectedType}
              selectedYear={selectedYear}
              selectedType={selectedType}
              availableYearsAndTypes={Object.keys(yearStats).map((year) => ({
                year,
                types: Object.keys(yearStats?.[year]),
              }))}
            />
            <View style={styles.metricsContainer}>
              <MonthStatisticsMetrics
                title={MONTH_STATISTICS[language].activities}
                metric={yearStats?.[selectedYear][selectedType]?.totalYearItems}
                postfix={''}
                isSuccess={isSuccess}
                isLoading={isLoading}
                isError={isError}
              />
              <MonthStatisticsMetrics
                title={MONTH_STATISTICS[language].distance}
                metric={`${Math.round(yearStats?.[selectedYear][selectedType]?.totalYearDistance)}`}
                postfix={`${isRussian ? 'км' : 'km'}`}
                isSuccess={isSuccess}
                isLoading={isLoading}
                isError={isError}
              />
              <MonthStatisticsMetrics
                title={MONTH_STATISTICS[language].duration}
                metric={`${Math.round(yearStats?.[selectedYear][selectedType]?.totalYearDuration)}`}
                postfix={`${isRussian ? 'ч' : 'h'}`}
                isSuccess={isSuccess}
                isLoading={isLoading}
                isError={isError}
              />
            </View>
            <Charts year={selectedYear} months={yearStats?.[selectedYear][selectedType].months} />
          </>
        )}
        {!isUserHasActivities && !isLoading && (
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
});
