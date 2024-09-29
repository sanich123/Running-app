import { useAppSelector } from '@R/typed-hooks';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { MONTH_STATISTICS } from './const';
import { MonthMetricsProps } from './types';

export default function MonthStatisticsMetrics({
  isSuccess,
  isLoading,
  isError,
  title,
  metric,
  postfix,
}: MonthMetricsProps) {
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  return (
    <View style={[styles.statistics, { borderColor: colors.onBackground }]}>
      {isSuccess && (
        <>
          <Text variant="bodySmall">{title}</Text>
          <Text variant="headlineMedium">{metric}</Text>
          <Text variant="bodyMedium">{postfix}</Text>
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
