import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, TouchableRipple, useTheme, Text } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import type { CalendarDateProps, CalendarDateWithActivityProps } from '../calendar/types';

export default function CalendarDateWithActivity({
  isWeekend,
  isTitle,
  dateValue,
  activities,
}: CalendarDateWithActivityProps & Omit<CalendarDateProps, 'isEmptyCell'>) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const activityIcon = getIconNameByTypeOfSport(activities[0]?.sport ?? 'unknown');
  return (
    <>
      {!isTitle ? (
        <TouchableRipple
          testID={`calendar-activities-${activities.map(({ id }) => id).join('-')}`}
          borderless
          style={[
            styles.dateItem,
            {
              backgroundColor: colors.primaryContainer,
              borderColor: colors.primary,
              borderWidth: 1,
            },
          ]}
          onPress={() => {
            if (!isTitle) {
              if (activities.length === 1) {
                push(`/${ROUTES.activity}/${activities[0].id}`);
              } else {
                push({
                  pathname: `/${ROUTES.activitiesList}/${ROUTES.routeIds}`,
                  params: { ids: activities.map(({ id }) => id) },
                });
              }
            }
          }}>
          <View style={styles.touchableContent}>
            {activities.length > 1 ? (
              <Text style={[styles.activityCountValue, { color: colors.onPrimaryContainer }]}>
                ×{activities.length}
              </Text>
            ) : (
              <View testID={`calendar-activity-icon-${activities[0]?.id}`}>
                <Icon source={activityIcon} size={20} color={colors.primary} />
              </View>
            )}
          </View>
        </TouchableRipple>
      ) : (
        <View style={[styles.dateItem, { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineVariant }]}>
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
  dateItem: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    display: 'flex',
    height: 54,
    justifyContent: 'center',
    width: '100%',
  },
  touchableContent: { alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' },
  activityCountValue: { fontSize: 16, fontWeight: '800' },
});
