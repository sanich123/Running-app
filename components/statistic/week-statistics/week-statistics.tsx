import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useGetCurrentWeekStatisticsQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { WEEK_STATISTICS } from './const';
import { getCurrentWeekDates } from './util';
import WeekStatisticsMetric from './week-statistics-metrics';

export default function WeekStatistics() {
  const { push } = useRouter();
  const { width } = useWindowDimensions();
  const { colors, dark } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { week, year, month } = getCurrentWeekDates();
  const {
    data: weekStatistics,
    isSuccess,
    isError,
    isLoading,
  } = useGetCurrentWeekStatisticsQuery(
    {
      userId,
      firstDay: week[0],
      lastDay: week[week.length - 1],
    },
    { skip: !userId },
  );
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() =>
        weekStatistics?.totalItems &&
        push(`/(protected)/${ROUTES.monthStatistic}?userId=${userId}&year=${year}&month=${month}`)
      }
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceVariant,
          width: width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          borderCurve: 'continuous',
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 10,
          shadowOpacity: 0.1,
          marginBottom: 5,
        },
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
