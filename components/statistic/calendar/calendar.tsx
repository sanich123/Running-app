import { StyleSheet, View } from 'react-native';
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
  const daysOfTheWeek = getDaysOfTheMonthWithNames(year, month, activities);

  return (
    <View style={styles.calendarContainer}>
      {Object.keys(daysOfTheWeek).map((day: string) => (
        <View style={styles.dayColumn} key={day}>
          {daysOfTheWeek[day as keyof typeof daysOfTheWeek].map(({ dateValue }, i) => (
            <View style={styles.dateItem} key={dateValue}>
              <Text
                variant="bodyLarge"
                style={{ color: dateValue === 'СБ' || (dateValue === 'ВС' && i === 0) ? 'red' : '' }}>
                {dateValue}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dayColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
    gap: 5,
  },
  calendarContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10,
    padding: 5,
  },
  dateItem: {
    height: 45,
    width: 45,
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
