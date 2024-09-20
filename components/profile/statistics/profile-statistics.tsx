import { useAuth } from '@A/context/auth-context';
import { MONTH_STATISTICS } from '@C/statistic/month-metric/const';
import MonthStatisticsMetrics from '@C/statistic/month-metric/month-metric';
import { LANGUAGES } from '@const/enums';
import { useGetAllTimeStatisticsByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function ProfileStatistics() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    data: allUserStatistics,
    isLoading,
    isError,
    isSuccess,
  } = useGetAllTimeStatisticsByUserIdQuery({ userId: `${user?.id}` }, { skip: !user?.id });
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {allUserStatistics?.totalItems && (
        <>
          <MonthStatisticsMetrics
            title={MONTH_STATISTICS[language].activities}
            metric={`${allUserStatistics?.totalItems}`}
            isSuccess={isSuccess}
            isLoading={isLoading}
            isError={isError}
            postfix={''}
          />
          <MonthStatisticsMetrics
            title={MONTH_STATISTICS[language].distance}
            metric={`${Math.round(allUserStatistics?.totalDistance / 1000)}`}
            isSuccess={isSuccess}
            isLoading={isLoading}
            isError={isError}
            postfix={`${isRussian ? 'км' : 'km'}`}
          />
          <MonthStatisticsMetrics
            title={MONTH_STATISTICS[language].duration}
            metric={`${Math.round(getHoursMinutesFromMilliseconds(allUserStatistics?.totalDuration).hours)}`}
            isSuccess={isSuccess}
            isLoading={isLoading}
            isError={isError}
            postfix={`${isRussian ? 'ч' : 'h'}`}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 40,
    columnGap: 5,
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
