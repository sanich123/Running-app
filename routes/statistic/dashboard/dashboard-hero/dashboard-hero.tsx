import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import Skeleton from '@S/skeleton/skeleton';
import { DASHBOARD_LAYOUT } from '../const';
import { formatMetricNumber, withAlpha } from '../utils';
import type { DashboardMetric } from '../types';
import type { DashboardHeroProps } from './types';

export default function DashboardHero({
  metric,
  metricTotals,
  hasSteps,
  hasCalories,
  activeDays,
  peakMonth,
  labels,
  onMetricChange,
  isRefreshing = false,
}: DashboardHeroProps) {
  const { colors } = useTheme();
  const metricItems: { key: DashboardMetric; label: string }[] = [
    { key: 'distance', label: labels.distance },
    { key: 'duration', label: labels.duration },
    { key: 'activities', label: labels.activities },
    ...(hasSteps ? [{ key: 'steps' as const, label: labels.steps }] : []),
    ...(hasCalories ? [{ key: 'caloriesActive' as const, label: labels.calories }] : []),
  ];
  const activeMetricLabel = metricItems.find(({ key }) => key === metric)?.label ?? labels.distance;

  return (
    <>
      <View style={[styles.metricSelector, { backgroundColor: colors.surfaceVariant }]}>
        <FlatList
          horizontal
          data={metricItems}
          keyExtractor={({ key }) => key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricSelectorContent}
          renderItem={({ item: { key, label } }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: metric === key }}
              onPress={() => onMetricChange(key)}
              style={[styles.metricOption, metric === key && { backgroundColor: colors.surface }]}>
              <Text
                variant="labelMedium"
                numberOfLines={1}
                style={{ color: metric === key ? colors.primary : colors.onSurfaceVariant }}>
                {label}
              </Text>
            </Pressable>
          )}
        />
      </View>
      <Card
        mode="contained"
        style={[styles.heroCard, { backgroundColor: colors.primaryContainer, borderColor: colors.outlineVariant }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroMainMetric}>
              <Text variant="labelLarge" style={{ color: colors.onPrimaryContainer }}>
                {activeMetricLabel}
              </Text>
              {isRefreshing ? (
                <Skeleton style={styles.heroValueSkeleton} />
              ) : (
                <Text
                  variant="displaySmall"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[styles.heroValue, { color: colors.onPrimaryContainer }]}>
                  {formatMetricNumber(metricTotals[metric], metric)}
                  <Text variant="titleMedium" style={{ color: colors.onPrimaryContainer }}>
                    {metric === 'distance'
                      ? ` ${labels.kilometres}`
                      : metric === 'duration'
                        ? ` ${labels.hours}`
                        : metric === 'steps'
                          ? ` ${labels.stepsUnit}`
                          : metric === 'caloriesActive'
                            ? ` ${labels.kilocalories}`
                            : ''}
                  </Text>
                </Text>
              )}
            </View>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
              <Icon
                source={
                  metric === 'distance'
                    ? 'map-marker-distance'
                    : metric === 'duration'
                      ? 'timer-outline'
                      : metric === 'activities'
                        ? 'run-fast'
                        : metric === 'steps'
                          ? 'shoe-print'
                          : 'fire'
                }
                color={colors.onPrimary}
                size={25}
              />
            </View>
          </View>
          <View style={[styles.summaryRow, { borderTopColor: withAlpha(colors.onPrimaryContainer, 0.16) }]}>
            {[
              { icon: 'calendar-check-outline', label: labels.activeDays, value: activeDays },
              { icon: 'dumbbell', label: labels.activities, value: metricTotals.activities },
              { icon: 'chart-line', label: labels.peakMonth, value: peakMonth },
            ].map(({ icon, label, value }) => (
              <View key={label} style={styles.summaryMetric}>
                <View style={styles.summaryLabelRow}>
                  <Icon source={icon} size={14} color={withAlpha(colors.onPrimaryContainer, 0.72)} />
                  <Text
                    variant="labelSmall"
                    numberOfLines={2}
                    style={[styles.summaryLabel, { color: withAlpha(colors.onPrimaryContainer, 0.72) }]}>
                    {label}
                  </Text>
                </View>
                {isRefreshing ? (
                  <Skeleton style={styles.summaryValueSkeleton} />
                ) : (
                  <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.onPrimaryContainer }]}>
                    {value}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  cardContent: { paddingHorizontal: DASHBOARD_LAYOUT.cardContentHorizontalPadding },
  metricSelector: { borderRadius: 16, marginBottom: 10, overflow: 'hidden', padding: 4 },
  metricSelectorContent: { alignItems: 'center', gap: 4 },
  metricOption: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  heroCard: { borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  heroTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heroMainMetric: { flex: 1, minWidth: 0 },
  heroValue: { fontFamily: FONT_FAMILIES.extraBold, marginTop: 3 },
  heroIcon: { alignItems: 'center', borderRadius: 16, height: 50, justifyContent: 'center', width: 50 },
  summaryRow: { borderTopWidth: 1, flexDirection: 'row', marginTop: 18, paddingTop: 13 },
  summaryMetric: { alignItems: 'center', flex: 1, minWidth: 0 },
  summaryLabelRow: { alignItems: 'center', minHeight: 34, width: '100%' },
  summaryLabel: { flexShrink: 1, lineHeight: 15, textAlign: 'center' },
  summaryValue: { fontFamily: FONT_FAMILIES.extraBold, marginTop: 4 },
  heroValueSkeleton: { borderRadius: 8, height: 42, marginTop: 7, width: 126 },
  summaryValueSkeleton: { borderRadius: 5, height: 21, marginTop: 5, width: 42 },
});
