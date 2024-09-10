import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { getDaysOfTheMonthWithNames } from './util';

export default function CalendarActivities({
  year,
  month,
  activities,
}: {
  year: string;
  month: string;
  activities: { duration: number; distance: number; id: string; sport: string; date: string }[];
}) {
  const { mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays } = getDaysOfTheMonthWithNames(
    year,
    month,
  );
  return (
    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: 10, padding: 5 }}>
      <View style={{ display: 'flex' }}>
        {mondays.map((day) => (
          <Text variant="bodyMedium">{day}</Text>
        ))}
      </View>
      <View style={{ display: 'flex' }}>
        {tuesdays.map((day) => (
          <Text variant="bodyMedium">{day}</Text>
        ))}
      </View>
      <View style={{ display: 'flex' }}>
        {wednesdays.map((day) => (
          <Text variant="bodyMedium">{day}</Text>
        ))}
      </View>
      <View style={{ display: 'flex' }}>
        {thursdays.map((day) => (
          <Text variant="bodyMedium">{day}</Text>
        ))}
      </View>
      <View style={{ display: 'flex' }}>
        {fridays.map((day) => (
          <Text variant="bodyMedium">{day}</Text>
        ))}
      </View>
      <View style={{ display: 'flex' }}>
        {saturdays.map((day) => (
          <Text variant="bodyMedium">{day}</Text>
        ))}
      </View>
      <View style={{ display: 'flex' }}>
        {sundays.map((day) => (
          <Text variant="bodyMedium">{day}</Text>
        ))}
      </View>
    </View>
  );
}
