import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { getCurrentWeekDates } from './util';
import { useGetCurrentWeekStatisticsQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { Href, useRouter } from 'expo-router';
import { LANGUAGES, ROUTES } from '@const/enums';
import WeekStatisticsMetric from './week-statistics-metrics';
import { WEEK_STATISTICS } from './const';
import { useAppSelector } from '@R/typed-hooks';

export default function WeekStatistics() {
  const { push } = useRouter();
  const { width } = useWindowDimensions();
  const { colors, dark } = useTheme();
  const { user } = useAuth();
  const { week, year, month } = getCurrentWeekDates();
  const {
    data: weekStatistics,
    isSuccess,
    isError,
    isLoading,
  } = useGetCurrentWeekStatisticsQuery(
    {
      userId: `${user?.id}`,
      firstDay: week[0],
      lastDay: week[week.length - 1],
    },
    { skip: !user?.id },
  );
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() =>
        weekStatistics?.totalItems &&
        push(`/${ROUTES.home}/${ROUTES.monthStatistic}?userId=${user?.id}&year=${year}&month=${month}` as Href)
      }
      style={[
        styles.container,
        { backgroundColor: colors.background, minWidth: Platform.OS === 'android' ? width : 550 },
      ]}>
      <>
        <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
          {WEEK_STATISTICS[language].report}
        </Text>
        <View style={{ marginVertical: 10 }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <WeekStatisticsMetric
              isError={isError}
              isSuccess={isSuccess}
              isLoading={isLoading}
              metrics={weekStatistics?.totalItems}
              title={WEEK_STATISTICS[language].activities}
            />
            <WeekStatisticsMetric
              isError={isError}
              isSuccess={isSuccess}
              isLoading={isLoading}
              metrics={`${getHoursMinutesFromMilliseconds(weekStatistics?.totalDuration).hours}${isRussian ? 'ч' : 'h'} ${getHoursMinutesFromMilliseconds(weekStatistics?.totalDuration).minutes}${isRussian ? 'мин' : 'min'}`}
              title={WEEK_STATISTICS[language].duration}
            />
            <WeekStatisticsMetric
              isError={isError}
              isSuccess={isSuccess}
              isLoading={isLoading}
              metrics={`${Math.round(weekStatistics?.totalDistance / 1000)} ${isRussian ? 'км' : 'km'}`}
              title={WEEK_STATISTICS[language].distance}
            />
          </View>
        </View>
      </>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 5,
    padding: 10,
    marginHorizontal: 'auto',
  },
});
