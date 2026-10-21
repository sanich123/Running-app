import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import Skeleton from '@S/skeleton/skeleton';
import { MONTH_STATISTICS } from '../const';
import type { MonthMetricsProps } from '../types';

export default function MonthStatisticsMetrics({
  isSuccess,
  isLoading,
  isError,
  title,
  metric,
  postfix,
}: MonthMetricsProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  return (
    <View style={[styles.statistics, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      {isSuccess && (
        <>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {title}
          </Text>
          <Text variant="titleLarge" style={{ color: colors.primary, fontFamily: FONT_FAMILIES.extraBold }}>
            {metric}
          </Text>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {postfix}
          </Text>
        </>
      )}
      {isLoading && <Skeleton testID="month-statistics-skeleton" style={styles.loadingSkeleton} />}
      {isError && <Text variant="bodySmall">{MONTH_STATISTICS[language].error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  statistics: {
    display: 'flex',
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    minHeight: 92,
    minWidth: 88,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 3,
  },
  loadingSkeleton: { width: '72%', height: 48 },
});
