import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import CalendarActivities from '../calendar/calendar';
import { useState } from 'react';
import MonthTypesChips from '../chips/month-types-chips';
import YearMonthTitle from '../year-month-title/year-month-title';
import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import MonthStatisticsMetrics from '../month-metric/month-metric';
import { useAppSelector } from '@R/typed-hooks';
import { MONTH_STATISTICS } from '../month-metric/const';
import { LANGUAGES } from '@const/enums';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import ErrorComponent from '@C/error-component/error-component';

export default function MonthStatistics() {
  const { colors } = useTheme();
  const { userId, year, month } = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState('all');
  const {
    data: monthStatistics,
    isSuccess,
    isError,
    error,
    isLoading,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;

  return (
    <View style={(isLoading || isError) && { flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
      {isLoading && <ActivityIndicator size="large" />}
      {isError && <ErrorComponent error={error} />}
      {isSuccess && (
        <>
          <YearMonthTitle year={`${year}`} month={`${month}`} />
          <MonthTypesChips
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            userId={`${userId}`}
            year={`${year}`}
            month={`${month}`}
          />
          <View style={styles.container}>
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].activities}
              metric={monthStatistics?.activitiesReducedBySport[selectedType]?.totalItems}
              postfix={''}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
            />
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].distance}
              metric={`${Math.round(monthStatistics?.activitiesReducedBySport[selectedType]?.totalDistance / 1000)}`}
              postfix={`${isRussian ? 'км' : 'km'}`}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
            />
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].duration}
              metric={`${Math.round(getHoursMinutesFromMilliseconds(monthStatistics?.activitiesReducedBySport[selectedType]?.totalDuration).hours)}`}
              postfix={`${isRussian ? 'ч' : 'h'}`}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
            />
          </View>
          <CalendarActivities year={`${year}`} month={`${month}`} userId={`${userId}`} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    marginVertical: 15,
  },
});
