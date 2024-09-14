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

export default function MonthStatistics() {
  const { userId, year, month } = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState('all');
  const {
    data: monthStatistics,
    isSuccess,
    isError,
    isLoading,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;
  return (
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
          isSuccess={isSuccess}
          isLoading={isLoading}
          isError={isError}
        />
        <MonthStatisticsMetrics
          title={MONTH_STATISTICS[language].distance}
          metric={`${Math.round(monthStatistics?.activitiesReducedBySport[selectedType]?.totalDistance / 1000)} ${isRussian ? 'км' : 'km'}`}
          isSuccess={isSuccess}
          isLoading={isLoading}
          isError={isError}
        />
        <MonthStatisticsMetrics
          title={MONTH_STATISTICS[language].duration}
          metric={`${Math.round(getHoursMinutesFromMilliseconds(monthStatistics?.activitiesReducedBySport[selectedType]?.totalDuration).hours)} ${isRussian ? 'ч' : 'h'}`}
          isSuccess={isSuccess}
          isLoading={isLoading}
          isError={isError}
        />
      </View>
      <CalendarActivities year={`${year}`} month={`${month}`} userId={`${userId}`} />
    </>
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
