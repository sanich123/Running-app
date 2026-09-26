import { LineChart } from 'react-native-gifted-charts';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import DashboardSectionHeader from './section-header';
import { formatMetricValue } from './utils';
import type { DashboardLabels, DashboardMetric } from './types';

export interface DashboardChartPoint {
  value: number;
  label: string;
  onPress: () => void;
}

interface AnnualActivityChartProps {
  data: DashboardChartPoint[];
  width: number;
  months: readonly string[];
  selectedMonth: number;
  metric: DashboardMetric;
  selectedValue: number;
  workoutCount: number;
  labels: DashboardLabels;
  onFocusMonth: (index: number) => void;
  onOpenMonth: (index: number) => void;
}

export default function AnnualActivityChart({
  data,
  width,
  months,
  selectedMonth,
  metric,
  selectedValue,
  workoutCount,
  labels,
  onFocusMonth,
  onOpenMonth,
}: AnnualActivityChartProps) {
  const { colors } = useTheme();
  return (
    <Card
      mode="contained"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Card.Content>
        <DashboardSectionHeader title={labels.yearActivity} subtitle={labels.byMonths} />
        <LineChart
          data={data}
          width={width}
          endSpacing={18}
          height={190}
          areaChart
          curved
          adjustToWidth
          hideRules
          hideYAxisText
          color={colors.primary}
          thickness={3}
          startFillColor={colors.primary}
          endFillColor={colors.primaryContainer}
          startOpacity={0.32}
          endOpacity={0.03}
          dataPointsColor={colors.primary}
          dataPointsRadius={7}
          focusedDataPointRadius={9}
          focusedDataPointColor={colors.primary}
          focusEnabled
          xAxisColor={colors.outlineVariant}
          yAxisColor="transparent"
          xAxisLabelTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10 }}
          onFocus={(_item: unknown, index: number) => onFocusMonth(index)}
        />
        <Text variant="labelSmall" style={[styles.chartHint, { color: colors.onSurfaceVariant }]}>
          {labels.chartHint}
        </Text>
        <Pressable
          testID="dashboard-selected-month"
          accessibilityRole="button"
          accessibilityLabel={`${months[selectedMonth]}, ${labels.openMonth}`}
          onPress={() => onOpenMonth(selectedMonth)}
          style={[styles.monthSummary, { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}>
          <View style={styles.monthSummaryText}>
            <Text variant="labelSmall" style={{ color: colors.onPrimaryContainer }}>
              {labels.selectedMonth}
            </Text>
            <Text variant="titleMedium" style={[styles.monthSummaryTitle, { color: colors.onPrimaryContainer }]}>
              {months[selectedMonth]}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onPrimaryContainer }}>
              {formatMetricValue(selectedValue, metric, labels)} · {workoutCount} {labels.activities.toLowerCase()}
            </Text>
          </View>
          <Icon source="calendar-month-outline" color={colors.onPrimaryContainer} size={22} />
        </Pressable>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  chartHint: { marginBottom: 10, marginTop: -6, textAlign: 'center' },
  monthSummary: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  monthSummaryText: { flex: 1 },
  monthSummaryTitle: { fontFamily: FONT_FAMILIES.extraBold, marginBottom: 2, marginTop: 1 },
});
