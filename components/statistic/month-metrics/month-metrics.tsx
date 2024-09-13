import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function MonthMetrics({
  userId,
  year,
  month,
  selectedType,
}: {
  selectedType: string;
  userId: string;
  year: string;
  month: string;
}) {
  const {
    data: monthStatistics,
    isSuccess,
    isError,
    isLoading,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  return (
    <View style={{ display: 'flex', flexDirection: 'row', padding: 10, justifyContent: 'space-between' }}>
      <View style={styles.statistics}>
        {isSuccess && <Text variant="bodySmall">Тренировок</Text>}
        {isSuccess && (
          <Text variant="titleLarge">{`${isSuccess ? monthStatistics?.activitiesReducedBySport[selectedType]?.totalItems : ''}`}</Text>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
      <View style={styles.statistics}>
        {isSuccess && <Text variant="bodySmall">Дистанция</Text>}
        {isSuccess && (
          <Text variant="titleLarge">{`${isSuccess ? Math.round(monthStatistics?.activitiesReducedBySport[selectedType]?.totalDistance / 1000) : ''} км`}</Text>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
      <View style={styles.statistics}>
        {isSuccess && <Text variant="bodySmall">Время</Text>}
        {isSuccess && (
          <Text variant="titleLarge">{`${isSuccess ? Math.round(getHoursMinutesFromMilliseconds(monthStatistics?.activitiesReducedBySport[selectedType]?.totalDuration).hours) : ''} ч`}</Text>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 40,
    columnGap: 5,
  },
  statistics: {
    display: 'flex',
    borderWidth: 1,
    borderRadius: 55,
    height: 110,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
