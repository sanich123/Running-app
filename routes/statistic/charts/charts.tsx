import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import BarChartWrapper from './bar-chart-wrapper';
import ChooseMetricsBtns from './choose-metrics-btns';
import { ChooseMetricsBtnsValues } from './types';
import { reduceMonthMetrics } from './utils';
import type { MonthMetrics } from './types';

export default function Charts({ year, months }: { year: number; months: MonthMetrics }) {
  const { colors } = useTheme();
  const [chartValue, setChartValue] = useState<ChooseMetricsBtnsValues>(ChooseMetricsBtnsValues.distance);
  const { language } = useAppSelector(({ settings }) => settings);
  const chartToRender = reduceMonthMetrics(months, language);
  const selectedChart = chartToRender[chartValue];

  return (
    <View style={styles.wrapper}>
      <Card
        mode="contained"
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text variant="titleLarge" style={styles.title}>
                {selectedChart?.title}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {year} · 12 месяцев
              </Text>
            </View>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          </View>
          <BarChartWrapper metricsArr={selectedChart?.items} year={year} title={selectedChart?.title} />
          <ChooseMetricsBtns chartValue={chartValue} setChartValue={setChartValue} />
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 10, marginBottom: 24 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  content: { paddingHorizontal: 0, paddingTop: 18, paddingBottom: 14 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18 },
  title: { fontWeight: '800' },
  legendDot: { borderRadius: 6, height: 12, width: 12 },
});
