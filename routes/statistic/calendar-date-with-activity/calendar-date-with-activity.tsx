import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple, useTheme, Text } from 'react-native-paper';
import { getIconByTypeOfSport } from '@U/icon-utils';
import type { CalendarDateProps, CalendarDateWithActivityProps } from '../calendar/types';
import type { SPORTS_BTNS_VALUES } from '@Routes/save-activity-page/sports-btns/const';

export default function CalendarDateWithActivity({
  isWeekend,
  isTitle,
  isEmptyCell,
  dateValue,
  activities,
}: CalendarDateWithActivityProps & CalendarDateProps) {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  return (
    <>
      {!isTitle ? (
        <TouchableRipple
          testID={`calendar-activities-${activities.map(({ id }) => id).join('-')}`}
          rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
          borderless
          style={[
            styles.dateItem,
            {
              backgroundColor: colors.primaryContainer,
              borderColor: colors.primary,
              borderWidth: isEmptyCell ? 0 : 1,
            },
          ]}
          onPress={() => {
            if (!isTitle) {
              if (activities.length === 1) {
                push(`/(protected)/activity/${activities[0].id}`);
              } else {
                push(`/(protected)/activities-list/${activities.map(({ id }) => `ids=${id}`).join('&')}`);
              }
            }
          }}>
          <Text
            variant={activities.length ? 'headlineMedium' : 'bodyMedium'}
            style={{
              color: colors.onPrimaryContainer,
              fontWeight: isTitle || !activities.length ? 'bold' : 'normal',
            }}>
            {activities.length > 1 && activities.length}
            {activities.length === 1 && getIconByTypeOfSport(activities[0].sport as SPORTS_BTNS_VALUES, 30)}
          </Text>
        </TouchableRipple>
      ) : (
        <View
          style={[
            styles.dateItem,
            {
              borderWidth: isEmptyCell ? 0 : 1,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <Text
            style={{
              color: isWeekend ? colors.error : colors.onBackground,
              fontWeight: isTitle || !activities.length ? 'bold' : 'normal',
            }}>
            {dateValue}
          </Text>
        </View>
      )}
    </>
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
    height: 40,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});
