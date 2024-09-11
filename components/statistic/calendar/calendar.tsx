import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { getDaysOfTheMonthWithNames } from './util';
import { CalendarStatisticsProps } from './types';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { useRouter } from 'expo-router';

export default function CalendarActivities({ year, month, activities }: CalendarStatisticsProps) {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const daysOfTheWeek = getDaysOfTheMonthWithNames(year, month, activities);

  return (
    <View style={styles.calendarContainer}>
      {Object.keys(daysOfTheWeek).map((day: string) => (
        <View style={styles.dayColumn} key={day}>
          {daysOfTheWeek[day as keyof typeof daysOfTheWeek].map(({ dateValue, activities }) => {
            const isWeekend = dateValue === 'СБ' || dateValue === 'ВС';
            const isEmptyCell = dateValue === ' ';
            const isTitle = isNaN(Number(dateValue));
            return (
              <>
                {activities.length ? (
                  <TouchableRipple
                    rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
                    borderless
                    style={[
                      styles.dateItem,
                      {
                        borderWidth: isEmptyCell ? 0 : 1,
                        borderColor: colors.onBackground,
                      },
                    ]}
                    key={dateValue}
                    onPress={() => activities.length === 1 && push(`/home/activity/${activities[0].id}`)}>
                    <Text
                      variant={activities.length ? 'headlineMedium' : 'bodyMedium'}
                      style={{
                        color: isWeekend ? colors.error : '',
                        fontWeight: isTitle || activities.length ? 'bold' : 'normal',
                      }}>
                      {activities.length > 1 && activities.length}
                      {activities.length === 1 && getIconByTypeOfSport(activities[0].sport as SPORTS_BTNS_VALUES, 30)}
                      {!activities.length && dateValue}
                    </Text>
                  </TouchableRipple>
                ) : (
                  <View
                    style={[
                      styles.dateItem,
                      {
                        borderWidth: isEmptyCell ? 0 : 1,
                        borderColor: colors.onBackground,
                      },
                    ]}>
                    <Text
                      variant={activities.length ? 'headlineMedium' : 'bodyMedium'}
                      style={{
                        color: isWeekend ? colors.error : '',
                        fontWeight: isTitle || activities.length ? 'bold' : 'normal',
                      }}>
                      {dateValue}
                    </Text>
                  </View>
                )}
              </>
            );
          })}
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
