import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, TouchableRipple, useTheme, Text } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { CALENDAR_SPORT_ICONS } from '../calendar/const';
import type { CalendarDateProps, CalendarDateWithActivityProps } from '../calendar/types';

export default function CalendarDateWithActivity({
  isWeekend,
  isTitle,
  isEmptyCell,
  dateValue,
  activities,
}: CalendarDateWithActivityProps & CalendarDateProps) {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const activityIcon = CALENDAR_SPORT_ICONS[activities[0]?.sport] ?? 'run-fast';
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
                push(`/${ROUTES.activity}/${activities[0].id}`);
              } else {
                push(`/${ROUTES.activitiesList}/${activities.map(({ id }) => `ids=${id}`).join('&')}`);
              }
            }
          }}>
          {activities.length > 1 ? (
            <View style={styles.activityCount}>
              <Icon source={activityIcon} size={17} color={colors.primary} />
              <Text style={[styles.activityCountValue, { color: colors.onPrimaryContainer }]}>{activities.length}</Text>
            </View>
          ) : (
            <Icon source={activityIcon} size={23} color={colors.primary} />
          )}
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
  activityCount: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  activityCountValue: { fontFamily: FONT_FAMILIES.extraBold, fontSize: 16 },
});
