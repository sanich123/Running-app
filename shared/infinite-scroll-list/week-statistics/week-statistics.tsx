import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetCurrentWeekStatisticsQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { getDeviceTimeZone } from '@U/time-zone';
import { WEEK_STATISTICS } from './const';
import { getCurrentWeekDates } from './util';
import WeekStatisticsMetric from './week-statistics-metrics';

export default function WeekStatistics() {
  const { push } = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const timeZone = getDeviceTimeZone();
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
      timeZone,
    },
    { skip: !userId },
  );
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;

  return (
    <TouchableRipple
      borderless
      onPress={() =>
        weekStatistics?.totalItems && push(`/${ROUTES.monthStatistics}?userId=${userId}&year=${year}&month=${month}`)
      }
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          width: width < MAX_MOBILE_WIDTH ? Math.max(width, 0) : MAX_MOBILE_WIDTH,
          alignSelf: 'center',
          borderCurve: 'continuous',
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          shadowOpacity: 0.1,
          borderColor: colors.outlineVariant,
          borderWidth: 1,
          marginBottom: 4,
        },
      ]}>
      <>
        <Text variant="labelMedium" style={{ fontFamily: FONT_FAMILIES.extraBold }}>
          {WEEK_STATISTICS[language].report}
        </Text>
        <View style={{ marginVertical: 4 }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <WeekStatisticsMetric
              isError={isError}
              isSuccess={isSuccess}
              isLoading={isLoading}
              metrics={`${weekStatistics?.totalItems ?? 0}`}
              title={WEEK_STATISTICS[language].activities}
            />
            <WeekStatisticsMetric
              isError={isError}
              isSuccess={isSuccess}
              isLoading={isLoading}
              metrics={`${getHoursMinutesFromMilliseconds(weekStatistics?.totalDuration ?? 0).hours}${isRussian ? 'ч' : 'h'} ${getHoursMinutesFromMilliseconds(weekStatistics?.totalDuration ?? 0).minutes}${isRussian ? 'мин' : 'min'}`}
              title={WEEK_STATISTICS[language].duration}
            />
            <WeekStatisticsMetric
              isError={isError}
              isSuccess={isSuccess}
              isLoading={isLoading}
              metrics={`${Math.round((weekStatistics?.totalDistance ?? 0) / 1000)} ${isRussian ? 'км' : 'km'}`}
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
    borderRadius: 8,
    padding: 8,
  },
});
