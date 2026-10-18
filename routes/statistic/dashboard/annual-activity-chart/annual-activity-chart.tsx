import { LineChart } from 'react-native-gifted-charts';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { DASHBOARD_LAYOUT } from '../const';
import DashboardSectionHeader from '../dashboard-section-header/dashboard-section-header';
import { formatChartAxisValue, formatMetricValue } from '../utils';
import type { AnnualActivityChartProps } from './types';

export default function AnnualActivityChart({
  data,
  width,
  months,
  selectedMonth,
  metric,
  selectedValue,
  averageValue,
  maxValue,
  noOfSections,
  stepValue,
  workoutCount,
  labels,
  onOpenMonth,
}: AnnualActivityChartProps) {
  const { colors } = useTheme();
  return (
    <Card
      mode="contained"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Card.Content style={styles.cardContent}>
        <DashboardSectionHeader title={labels.yearActivity} subtitle={labels.byMonths} />
        <LineChart
          data={data}
          width={width}
          endSpacing={DASHBOARD_LAYOUT.chartEndSpacing}
          height={190}
          areaChart
          curved={false}
          adjustToWidth
          maxValue={maxValue}
          noOfSections={noOfSections}
          stepValue={stepValue}
          yAxisOffset={0}
          onlyPositive
          yAxisLabelWidth={DASHBOARD_LAYOUT.chartYAxisLabelWidth}
          yAxisLabelSuffix={
            metric === 'distance' ? ` ${labels.kilometres}` : metric === 'duration' ? ` ${labels.hours}` : ''
          }
          formatYLabel={(value: string) => formatChartAxisValue(value, metric)}
          yAxisTextStyle={{ color: colors.onSurfaceVariant, fontSize: 9 }}
          showFractionalValues={metric === 'distance' || metric === 'duration'}
          hideRules={false}
          rulesColor={colors.outlineVariant}
          rulesType="dashed"
          rulesThickness={1}
          color={colors.primary}
          thickness={3}
          startFillColor={colors.primary}
          endFillColor={colors.primaryContainer}
          startOpacity={0.32}
          endOpacity={0.03}
          dataPointsColor={colors.primary}
          dataPointsRadius={7}
          focusEnabled={false}
          xAxisColor={colors.outlineVariant}
          yAxisColor="transparent"
          xAxisLabelTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10 }}
          showReferenceLine1={averageValue > 0}
          referenceLine1Position={averageValue}
          referenceLine1Config={{
            thickness: 1,
            color: colors.primary,
            type: 'dashed',
            dashWidth: 4,
            dashGap: 4,
          }}
        />
        <View style={styles.averageRow}>
          <View style={[styles.averageMarker, { borderColor: colors.primary }]} />
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {labels.yearAverage}:{' '}
            {metric === 'activities' && !Number.isInteger(averageValue)
              ? averageValue.toFixed(1)
              : formatMetricValue(averageValue, metric, labels)}
          </Text>
        </View>
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
  cardContent: { paddingHorizontal: DASHBOARD_LAYOUT.cardContentHorizontalPadding },
  averageRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 8, marginTop: -2 },
  averageMarker: { borderStyle: 'dashed', borderTopWidth: 1, marginRight: 7, width: 16 },
  chartHint: { marginBottom: 10, textAlign: 'center' },
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
