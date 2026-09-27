import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import Skeleton from '@S/skeleton/skeleton';
import { DASHBOARD_LAYOUT } from './const';
import { formatMetricNumber, withAlpha } from './utils';
import type { DashboardLabels, DashboardMetric, DashboardMetricTotals } from './types';

interface DashboardHeroProps {
  metric: DashboardMetric;
  metricTotals: DashboardMetricTotals;
  activeDays: number;
  peakMonth: string;
  labels: DashboardLabels;
  onMetricChange: (metric: DashboardMetric) => void;
  isRefreshing?: boolean;
}

export default function DashboardHero({
  metric,
  metricTotals,
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
  ];
  const activeMetricLabel = metricItems.find(({ key }) => key === metric)?.label ?? labels.distance;

  return (
    <>
      <View style={[styles.metricSelector, { backgroundColor: colors.surfaceVariant }]}>
        {metricItems.map(({ key, label }) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: metric === key }}
            onPress={() => onMetricChange(key)}
            style={[styles.metricOption, metric === key && { backgroundColor: colors.surface }]}>
            <Text variant="labelLarge" style={{ color: metric === key ? colors.primary : colors.onSurfaceVariant }}>
              {label}
            </Text>
          </Pressable>
        ))}
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
                    {metric === 'distance' ? ` ${labels.kilometres}` : metric === 'duration' ? ` ${labels.hours}` : ''}
                  </Text>
                </Text>
              )}
            </View>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
              <Icon
                source={
                  metric === 'distance' ? 'map-marker-distance' : metric === 'duration' ? 'timer-outline' : 'run-fast'
                }
                color={colors.onPrimary}
                size={25}
              />
            </View>
          </View>
          <View style={[styles.summaryRow, { borderTopColor: withAlpha(colors.onPrimaryContainer, 0.16) }]}>
            <SummaryMetric
              icon="calendar-check-outline"
              label={labels.activeDays}
              value={activeDays}
              isRefreshing={isRefreshing}
            />
            <SummaryMetric
              icon="dumbbell"
              label={labels.activities}
              value={metricTotals.activities}
              isRefreshing={isRefreshing}
            />
            <SummaryMetric icon="chart-line" label={labels.peakMonth} value={peakMonth} isRefreshing={isRefreshing} />
          </View>
        </Card.Content>
      </Card>
    </>
  );
}

export function DashboardHeroSkeleton() {
  const { colors } = useTheme();
  return (
    <Card mode="contained" style={[styles.heroCard, { backgroundColor: colors.primaryContainer }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroMainMetric}>
            <Skeleton style={styles.labelSkeleton} />
            <Skeleton style={styles.heroValueSkeleton} />
          </View>
          <Skeleton style={styles.iconSkeleton} />
        </View>
        <View style={[styles.summaryRow, { borderTopColor: withAlpha(colors.onPrimaryContainer, 0.16) }]}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.summaryMetric}>
              <Skeleton style={styles.summaryLabelSkeleton} />
              <Skeleton style={styles.summaryValueSkeleton} />
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
  isRefreshing,
}: {
  icon: string;
  label: string;
  value: number | string;
  isRefreshing: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryMetric}>
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
  );
}

const styles = StyleSheet.create({
  cardContent: { paddingHorizontal: DASHBOARD_LAYOUT.cardContentHorizontalPadding },
  metricSelector: { borderRadius: 16, flexDirection: 'row', gap: 4, marginBottom: 10, padding: 4 },
  metricOption: { alignItems: 'center', borderRadius: 12, flex: 1, paddingHorizontal: 8, paddingVertical: 9 },
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
  labelSkeleton: { borderRadius: 4, height: 12, marginTop: 5, width: 70 },
  heroValueSkeleton: { borderRadius: 8, height: 42, marginTop: 7, width: 126 },
  iconSkeleton: { borderRadius: 16, height: 50, width: 50 },
  summaryLabelSkeleton: { height: 10, width: 54 },
  summaryValueSkeleton: { borderRadius: 5, height: 21, marginTop: 5, width: 42 },
});
