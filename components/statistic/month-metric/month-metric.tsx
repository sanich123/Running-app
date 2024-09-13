import { useAppSelector } from '@R/typed-hooks';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { MONTH_STATISTICS } from './const';
import { MonthMetricsProps } from './types';

export default function MonthStatisticsMetrics({ isSuccess, isLoading, isError, title, metric }: MonthMetricsProps) {
  const { language } = useAppSelector(({ language }) => language);

  return (
    <View style={styles.statistics}>
      {isSuccess && (
        <>
          <Text variant="bodySmall">{title}</Text>
          <Text variant="headlineSmall">{metric}</Text>
        </>
      )}
      {isLoading && <ActivityIndicator size="small" />}
      {isError && <Text variant="bodySmall">{MONTH_STATISTICS[language].error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  statistics: {
    display: 'flex',
    borderWidth: 1,
    borderRadius: 55,
    height: 110,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 6,
  },
});
