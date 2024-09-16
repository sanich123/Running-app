import { TouchableRipple, useTheme, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Href, usePathname, useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { CalendarDateProps, CalendarDateWithActivityProps } from '../calendar/types';

export default function CalendarDateWithActivity({
  isWeekend,
  isTitle,
  isEmptyCell,
  dateValue,

  activities,
}: CalendarDateWithActivityProps & CalendarDateProps) {
  const { colors, dark } = useTheme();
  const pathname = usePathname();
  const root = pathname.includes(ROUTES.home) ? ROUTES.home : ROUTES.statistic;
  const { push } = useRouter();
  return (
    <>
      {!isTitle ? (
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
          onPress={() => {
            if (!isTitle) {
              if (activities.length === 1) {
                push(`/${root}/activity/${activities[0].id}` as Href);
              } else {
                push(`/${root}/activities-list/${activities.map(({ id }) => `ids=${id}`).join('&')}` as Href);
              }
            }
          }}>
          <Text

            variant={activities.length ? 'headlineMedium' : 'bodyMedium'}
            style={{
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
              borderColor: colors.onBackground,
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
    height: 45,
    width: 45,
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
