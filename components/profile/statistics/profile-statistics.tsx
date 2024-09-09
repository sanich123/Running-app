import { useAuth } from '@A/context/auth-context';
import { useGetAllTimeStatisticsByUserIdQuery } from '@R/runich-api/runich-api';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';

export default function ProfileStatistics() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    data: allUserStatistics,
    isLoading,
    isError,
    isSuccess,
  } = useGetAllTimeStatisticsByUserIdQuery({ userId: `${user?.id}` }, { skip: !user?.id });
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.statistics}>
        {isSuccess && (
          <>
            <Text variant="bodySmall">Дистанция</Text>
            <Text variant="titleLarge">{`${Math.round(allUserStatistics?.totalDistance / 1000)} км`}</Text>
          </>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
      <View style={styles.statistics}>
        {isSuccess && (
          <>
            <Text variant="bodySmall">Время</Text>
            <Text variant="titleLarge">{`${Math.round(getHoursMinutesFromMilliseconds(allUserStatistics?.totalDuration).hours)} ч`}</Text>
          </>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
      <View style={styles.statistics}>
        {isSuccess && (
          <>
            <Text variant="bodySmall">Тренировок</Text>
            <Text variant="titleLarge">{`${allUserStatistics?.totalItems}`}</Text>
          </>
        )}
        {isLoading && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodySmall">Ошибка</Text>}
      </View>
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
