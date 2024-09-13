import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import CalendarActivities from '../calendar/calendar';
import { useState } from 'react';
import MonthTypesChips from '../chips/month-types-chips';
import MonthMetrics from '../month-metrics/month-metrics';

export default function MonthStatistics() {
  const { userId, year, month } = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState('all');

  return (
    <>
      <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
        <Text variant="headlineMedium">{`${new Date(+year, +month).toLocaleDateString('ru', { month: 'long', year: 'numeric' })}`}</Text>
      </View>
      <MonthTypesChips
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        userId={`${userId}`}
        year={`${year}`}
        month={`${month}`}
      />
      <MonthMetrics userId={`${userId}`} year={`${year}`} month={`${month}`} selectedType={selectedType} />
      <CalendarActivities year={`${year}`} month={`${month}`} userId={`${userId}`} />
    </>
  );
}
