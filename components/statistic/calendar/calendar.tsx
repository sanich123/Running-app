import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { getDaysOfTheMonthWithNames } from './util';
import { CalendarStatisticsProps } from './types';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { Href, usePathname, useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import ErrorComponent from '@C/error-component/error-component';

export default function CalendarActivities({ year, month, userId }: CalendarStatisticsProps) {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
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
  const daysOfTheWeek = getDaysOfTheMonthWithNames(year, month, monthStatistics?.activities);
  return (
    <View style={styles.calendarContainer}>
      {isSuccess && (
        <>
          {Object.keys(daysOfTheWeek).map((day: string, i: number) => (
            <View style={styles.dayColumn} key={`${day}${i}`}>
              {daysOfTheWeek[day as keyof typeof daysOfTheWeek].map(({ dateValue, activities }, i) => {
                const isWeekend = dateValue === 'СБ' || dateValue === 'ВС';
                const isEmptyCell = dateValue === ' ';
                const isTitle = isNaN(Number(dateValue));
                const root = pathname.includes(ROUTES.home) ? ROUTES.home : ROUTES.statistic;
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
                        key={`${dateValue}+${day}${i}`}
                        onPress={() => {
                          if (activities.length === 1) {
                            push(`/${root}/activity/${activities[0].id}` as Href);
                          } else {
                            push(
                              `/${root}/activities-list/${activities.map(({ id }) => `ids=${id}`).join('&')}` as Href,
                            );
                          }
                        }}>
                        <Text
                          variant={activities.length ? 'headlineMedium' : 'bodyMedium'}
                          style={{
                            color: isWeekend ? colors.error : '',
                            fontWeight: isTitle || activities.length ? 'bold' : 'normal',
                          }}>
                          {activities.length > 1 && activities.length}
                          {activities.length === 1 &&
                            getIconByTypeOfSport(activities[0].sport as SPORTS_BTNS_VALUES, 30)}
                          {!activities.length && dateValue}
                        </Text>
                      </TouchableRipple>
                    ) : (
                      <View
                        key={`${dateValue}+${day}${i}`}
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
