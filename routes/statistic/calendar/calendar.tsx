import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES } from '@const/enums';
import { useGetMonthStatisticsQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { getDeviceTimeZone } from '@U/time-zone';
import { REDUCED_DAY_NAME_EN, REDUCED_DAY_NAME_RU } from './const';
import { getCalendarGridDays } from './util';
import CalendarDateEmpty from '../calendar-date-empty/calendar-date-empty';
import CalendarDateWithActivity from '../calendar-date-with-activity/calendar-date-with-activity';
import type { CalendarStatisticsProps } from './types';

export default function CalendarActivities({ year, month, userId, selectedType }: CalendarStatisticsProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const timeZone = getDeviceTimeZone();
  const {
    data: monthStatistics,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}`, timeZone },
    { skip: !userId || !year || !month },
  );
  const activities = monthStatistics?.activities ?? [];
  const visibleActivities =
    selectedType === 'all' ? activities : activities.filter(({ sport }) => sport === selectedType);
  const calendarDays = getCalendarGridDays(year, month, visibleActivities);
  const activeDays = calendarDays.filter(({ activities: dayActivities }) => dayActivities.length > 0).length;
  const weekdays =
    language === LANGUAGES.russian ? Object.values(REDUCED_DAY_NAME_RU) : Object.values(REDUCED_DAY_NAME_EN);

  return (
    <Card
      mode="contained"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 10,
        },
      ]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="titleLarge" style={styles.title}>
              {language === 'russian' ? 'Календарь тренировок' : 'Training calendar'}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {language === 'russian' ? 'Нажмите на день, чтобы открыть тренировку' : 'Tap a day to open a workout'}
            </Text>
          </View>
          {isSuccess && (
            <View style={styles.summary}>
              <Text variant="labelLarge" style={{ color: colors.primary }}>
                {visibleActivities.length}
              </Text>
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                {language === LANGUAGES.russian ? 'трен.' : 'workouts'}
              </Text>
              <Text variant="labelLarge" style={{ color: colors.primary, marginLeft: 8 }}>
                {activeDays}
              </Text>
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                {language === LANGUAGES.russian ? 'активн.' : 'active'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.calendarContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" testID="calendar-loading" />
          ) : isSuccess ? (
            <>
              <View style={styles.weekdayRow}>
                {weekdays.map((weekday) => (
                  <View key={weekday} style={styles.gridCell}>
                    <Text variant="labelSmall" style={[styles.weekday, { color: colors.onSurfaceVariant }]}>
                      {weekday}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.grid}>
                {calendarDays.map((day, index) => (
                  <View key={`${day.dateValue || 'empty'}-${index}`} style={styles.gridCell}>
                    {day.activities.length > 0 ? (
                      <CalendarDateWithActivity
                        isWeekend={day.isWeekend}
                        isTitle={false}
                        dateValue={day.dateValue}
                        activities={day.activities}
                      />
                    ) : (
                      <CalendarDateEmpty isTitle={false} isEmptyCell={day.isEmptyCell} dateValue={day.dateValue} />
                    )}
                  </View>
                ))}
              </View>
            </>
          ) : isError ? (
            <ErrorComponent error={error} refetch={refetch} />
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, marginBottom: 24 },
  content: { paddingHorizontal: 12, paddingVertical: 16 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  headerText: { flex: 1, minWidth: 0 },
  title: { fontWeight: '800' },
  summary: { alignItems: 'center', flexDirection: 'row', paddingTop: 3 },
  calendarContainer: {
    marginTop: 18,
  },
  weekdayRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: {
    paddingHorizontal: 2,
    width: '14.2857%',
  },
});
