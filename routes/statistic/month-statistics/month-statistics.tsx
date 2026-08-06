import { useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES } from '@const/enums';
import { useGetMonthStatisticsQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@Routes/error-component/error-component';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import CalendarActivities from '../calendar/calendar';
import MonthTypesChips from '../chips/month-types-chips';
import { MONTH_STATISTICS } from '../month-metric/const';
import MonthStatisticsMetrics from '../month-metric/month-metric';
import YearMonthTitle from '../year-month-title/year-month-title';

export default function MonthStatistics() {
  const { width } = useWindowDimensions();
  const { userId, year, month } = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState('all');
  const {
    data: monthStatistics,
    isSuccess,
    isError,
    error,
    isLoading,
    refetch,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;
  return (
    <CrossPlatformLayout
      edges={[]}
      scrollViewEnabled
      isError={isError}
      isLoading={isLoading}
      outerStyles={{ padding: 10 }}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="month-statistics-loading" />
      ) : isSuccess ? (
        <>
          <YearMonthTitle year={`${year}`} month={`${month}`} />
          <MonthTypesChips
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            userId={`${userId}`}
            year={`${year}`}
            month={`${month}`}
          />
          <View
            style={[
              styles.container,
              {
                width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
                marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
              },
            ]}>
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
          <CalendarActivities year={`${year}`} month={`${month}`} userId={`${userId}`} selectedType={selectedType} />
        </>
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
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
