import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetAllTimeStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import { MONTH_STATISTICS } from '@S/month-metric/const';
import MonthStatisticsMetrics from '@S/month-metric/month-metric';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { PROFILE_SECTIONS } from '../const';

export default function ProfileStatistics({ whosProfile }: { whosProfile: string }) {
  const { colors } = useTheme();
  const {
    data: allUserStatistics,
    isLoading,
    isError,
    isSuccess,
  } = useGetAllTimeStatisticsByUserIdQuery({ userId: whosProfile }, { skip: !whosProfile });
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;

  if (isError) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Text variant="titleMedium" style={{ color: colors.primary, fontFamily: FONT_FAMILIES.semiBold }}>
        {PROFILE_SECTIONS[language].trainingSummary}
      </Text>
      <View style={styles.metricsRow}>
        {isLoading || allUserStatistics?.totalItems ? (
          <>
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].activities}
              metric={`${allUserStatistics?.totalItems ?? 0}`}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
              postfix={''}
            />
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].distance}
              metric={`${Math.round((allUserStatistics?.totalDistance ?? 0) / 1000)}`}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
              postfix={`${isRussian ? 'км' : 'km'}`}
            />
            <MonthStatisticsMetrics
              title={MONTH_STATISTICS[language].duration}
              metric={`${Math.round(getHoursMinutesFromMilliseconds(allUserStatistics?.totalDuration ?? 0).hours)}`}
              isSuccess={isSuccess}
              isLoading={isLoading}
              isError={isError}
              postfix={`${isRussian ? 'ч' : 'h'}`}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statistics: {
    display: 'flex',
    borderWidth: 1,
    borderRadius: 55,
    height: 110,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
