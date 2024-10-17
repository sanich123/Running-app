import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { getDaysOfTheMonthWithNames } from './util';
import { CalendarStatisticsProps } from './types';
import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import ErrorComponent from '@C/error-component/error-component';
import CalendarDateWithActivity from '../calendar-date-with-activity/calendar-date-with-activity';
import CalendarDateEmpty from '../calendar-date-empty/calendar-date-empty';
import { useAppSelector } from '@R/typed-hooks';
import { REDUCED_DAY_NAME_EN, REDUCED_DAY_NAME_RU } from './const';
import { Fragment } from 'react';
import { MAX_MOBILE_WIDTH } from '@const/const';

export default function CalendarActivities({ year, month, userId, selectedType }: CalendarStatisticsProps) {
  const { language } = useAppSelector(({ language }) => language);
  const { width } = useWindowDimensions();
  const {
    data: monthStatistics,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const daysOfTheWeek = getDaysOfTheMonthWithNames(year, month, monthStatistics?.activities, language);

  return (
    <View
      style={[
        styles.calendarContainer,
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isSuccess && (
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
      )}
      {isError && <ErrorComponent error={error} />}
      {isLoading && <ActivityIndicator size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  dayColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
