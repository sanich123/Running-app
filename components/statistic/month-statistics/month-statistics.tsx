import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Chip, Text } from 'react-native-paper';
import CalendarActivities from '../calendar/calendar';
import { useState } from 'react';

export default function MonthStatistics() {
  const { userId, year, month } = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState('все виды');
  const {
    data: monthStatistics,
    isLoading,
    isSuccess,
    isError,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const typesOfSport = monthStatistics?.activitiesReducedBySport.reduce(
    (acc: string[], item: { [key: string]: {} }) => [...acc, ...Object.keys(item)],
    [],
  );
  return (
    <>
      <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
        <Text variant="headlineMedium">{`${new Date(+year, +month).toLocaleDateString('ru', { month: 'long', year: 'numeric' })}`}</Text>
      </View>
      <View style={{ margin: 10 }}>
        {isSuccess && (
          <FlatList
            data={['все виды', ...typesOfSport]}
            renderItem={({ item: type, index }) => {
              return (
                <Chip
                  key={type}
                  style={{ marginLeft: index ? 5 : 0 }}
                  onPress={() => setSelectedType(type)}
                  selected={type === selectedType}
                  showSelectedOverlay>
                  {type}
                </Chip>
              );
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      <View style={{ display: 'flex', flexDirection: 'row', padding: 10, justifyContent: 'space-between' }}>
        <View style={styles.statistics}>
          {isSuccess && <Text variant="bodySmall">Тренировок</Text>}
          {isSuccess && <Text variant="titleLarge">{`${isSuccess ? monthStatistics?.totalItems : ''}`}</Text>}
          {isLoading && <ActivityIndicator size="small" />}
          {isError && <Text variant="bodySmall">Ошибка</Text>}
        </View>
        <View style={styles.statistics}>
          {isSuccess && <Text variant="bodySmall">Дистанция</Text>}
          {isSuccess && (
            <Text variant="titleLarge">{`${isSuccess ? Math.round(monthStatistics?.totalDistance / 1000) : ''} км`}</Text>
          )}
          {isLoading && <ActivityIndicator size="small" />}
          {isError && <Text variant="bodySmall">Ошибка</Text>}
        </View>
        <View style={styles.statistics}>
          {isSuccess && <Text variant="bodySmall">Время</Text>}
          {isSuccess && (
            <Text variant="titleLarge">{`${isSuccess ? Math.round(getHoursMinutesFromMilliseconds(monthStatistics?.totalDuration).hours) : ''} ч`}</Text>
          )}
          {isLoading && <ActivityIndicator size="small" />}
          {isError && <Text variant="bodySmall">Ошибка</Text>}
        </View>
      </View>
      {isSuccess ? (
        <CalendarActivities year={`${year}`} month={`${month}`} activities={monthStatistics?.activities} />
      ) : null}
    </>
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
