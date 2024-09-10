import { View } from 'react-native';
import { ActivityIndicator, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { getCurrentWeekDates } from './util';
import { useGetCurrentWeekStatisticsQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';

export default function WeekStatistics() {
  const { push } = useRouter();
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

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() => push(`/${ROUTES.home}/${ROUTES.monthStatistic}?userId=${user?.id}&year=${year}&month=${month}`)}
      style={{
        padding: 10,
        backgroundColor: colors.background,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 5,
      }}>
      <>
        <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
          Ваш отчет за неделю
        </Text>
        <View style={{ marginVertical: 10 }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <View style={{ display: 'flex', width: '33%', alignItems: 'center' }}>
              <Text variant="bodySmall">Тренировки</Text>
              {isError && <Text variant="bodyLarge">Ошибка</Text>}
              {isSuccess && <Text variant="headlineSmall">{weekStatistics?.totalItems}</Text>}
              {isLoading && <ActivityIndicator size="small" />}
            </View>
            <View style={{ display: 'flex', width: '33%', alignItems: 'center' }}>
              <Text variant="bodySmall">Время</Text>
              {isError && <Text variant="bodyLarge">Ошибка</Text>}
              {isSuccess && (
                <Text variant="headlineSmall">{`${getHoursMinutesFromMilliseconds(weekStatistics?.totalDuration).hours}ч. ${getHoursMinutesFromMilliseconds(weekStatistics?.totalDuration).minutes}мин`}</Text>
              )}
              {isLoading && <ActivityIndicator size="small" />}
            </View>
            <View style={{ display: 'flex', width: '33%', alignItems: 'center' }}>
              <Text variant="bodySmall">Дистанция</Text>
              {isSuccess && (
                <Text variant="headlineSmall">{`${Math.round(weekStatistics?.totalDistance / 1000)} км`}</Text>
              )}
              {isLoading && <ActivityIndicator size="small" />}
              {isError && <Text variant="bodyLarge">Ошибка</Text>}
            </View>
          </View>
        </View>
      </>
    </TouchableRipple>
  );
}
