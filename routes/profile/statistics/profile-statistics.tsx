import { View, StyleSheet } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { useGetAllTimeStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import { MONTH_STATISTICS } from '@S/month-metric/const';
import MonthStatisticsMetrics from '@S/month-metric/month-metric';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';

export default function ProfileStatistics({ whosProfile }: { whosProfile: string }) {
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
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
