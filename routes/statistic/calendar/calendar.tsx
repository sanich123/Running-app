import { Fragment } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetMonthStatisticsQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@Routes/error-component/error-component';
import { REDUCED_DAY_NAME_EN, REDUCED_DAY_NAME_RU } from './const';
import { getDaysOfTheMonthWithNames } from './util';
import CalendarDateEmpty from '../calendar-date-empty/calendar-date-empty';
import CalendarDateWithActivity from '../calendar-date-with-activity/calendar-date-with-activity';
import type { CalendarStatisticsProps } from './types';

export default function CalendarActivities({ year, month, userId, selectedType }: CalendarStatisticsProps) {
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const {
    data: monthStatistics,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const daysOfTheWeek = getDaysOfTheMonthWithNames(year, month, monthStatistics?.activities, language);

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
          <View>
            <Text variant="titleLarge" style={styles.title}>
              {language === 'russian' ? 'Календарь тренировок' : 'Training calendar'}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {language === 'russian' ? 'Нажмите на день, чтобы открыть тренировку' : 'Tap a day to open a workout'}
            </Text>
          </View>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.calendarContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" />
          ) : isSuccess ? (
            <>
              {Object.keys(daysOfTheWeek).map((day: string, i: number) => (
                <View style={styles.dayColumn} key={`${day}${i}`}>
                  {daysOfTheWeek[day as keyof typeof daysOfTheWeek].map(({ dateValue, activities }, i) => {
                    const isWeekend =
                      dateValue === REDUCED_DAY_NAME_RU.saturday ||
                      dateValue === REDUCED_DAY_NAME_RU.sunday ||
                      dateValue === REDUCED_DAY_NAME_EN.saturday ||
                      dateValue === REDUCED_DAY_NAME_EN.sunday;
                    const isEmptyCell = dateValue === ' ';
                    const isTitle = isNaN(Number(dateValue));
                    const filteredActivities = activities.filter(({ sport }) => sport === selectedType);
                    const whatActivitiesToRender = selectedType === 'all' ? activities : filteredActivities;

                    return (
                      <Fragment key={`${dateValue}${i}`}>
                        {whatActivitiesToRender?.length || !i ? (
                          <CalendarDateWithActivity
                            isWeekend={isWeekend}
                            isTitle={isTitle}
                            isEmptyCell={isEmptyCell}
                            dateValue={dateValue}
                            activities={whatActivitiesToRender}
                          />
                        ) : (
                          <CalendarDateEmpty isTitle={isTitle} isEmptyCell={isEmptyCell} dateValue={dateValue} />
                        )}
                      </Fragment>
                    );
                  })}
                </View>
              ))}
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
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  title: { fontWeight: '800' },
  legendDot: { borderRadius: 6, height: 12, width: 12 },
  dayColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  calendarContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingHorizontal: 0,
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
