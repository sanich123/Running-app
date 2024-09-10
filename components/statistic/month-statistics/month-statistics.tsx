import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function MonthStatistics() {
  const { userId, year, month } = useLocalSearchParams();
  const {
    data: monthStatistics,
    isLoading,
    isSuccess,
    isError,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  console.log(monthStatistics);
  return (
    <View style={{ display: 'flex', flexDirection: 'row', padding: 10, justifyContent: 'space-between' }}>
      <View style={styles.statistics}>
        {isSuccess && (
          <>
            <Text variant="bodySmall">Тренировок</Text>
            <Text variant="titleLarge">{`${monthStatistics?.totalItems}`}</Text>
          </>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
      <View style={styles.statistics}>
        {isSuccess && (
          <>
            <Text variant="bodySmall">Дистанция</Text>
            <Text variant="titleLarge">{`${Math.round(monthStatistics?.totalDistance / 1000)} км`}</Text>
          </>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
      <View style={styles.statistics}>
        {isSuccess && (
          <>
            <Text variant="bodySmall">Время</Text>
            <Text variant="titleLarge">{`${Math.round(getHoursMinutesFromMilliseconds(monthStatistics?.totalDuration).hours)} ч`}</Text>
          </>
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
