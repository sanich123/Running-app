import { LineChart } from 'react-native-gifted-charts';
import { useWindowDimensions, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Divider, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityChartDataQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import {
  buildHeartRateChartSeries,
  formatHeartRateChartMetric,
  formatHeartRateChartRange,
  getHeartRateChartMetricLabel,
} from './utils';
import { HOME_ACTIVITY_FULL_VIEW } from '../metrics/const';
import type { HeartRateChartProps } from './types';

export default function HeartRateChart({ activityId, activityDistance, sport }: HeartRateChartProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data, error, isLoading, refetch } = useGetActivityChartDataQuery(
    { activityId, viewerId: userId ?? '' },
    { skip: !userId },
  );
  const labels = HOME_ACTIVITY_FULL_VIEW[language];
  const chartSeries = data ? buildHeartRateChartSeries(data, sport, activityDistance) : [];
  const lineColors = [colors.error, colors.primary, colors.secondary];
  const chartWidth = Math.max(220, Math.min(width, MAX_MOBILE_WIDTH) - 56);
  const shouldShowChart = !isLoading && !error && chartSeries.length > 0;

  return (
    <>
      {isLoading ? (
        <View style={styles.state}>
          <Divider />
          <ActivityIndicator size="small" />
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {labels.chartLoading}
          </Text>
        </View>
      ) : null}
      {!isLoading && error ? <ErrorComponent error={error} refetch={refetch} /> : null}
      {shouldShowChart ? (
        <View style={styles.section}>
          <Divider />
          <Text variant="bodyLarge" style={styles.title}>
            {labels.heartRateChartTitle}
          </Text>
          <LineChart
            dataSet={chartSeries.map((series, index) => ({
              data: series.data,
              color: lineColors[index],
              thickness: 2,
              hideDataPoints: true,
            }))}
            width={chartWidth}
            height={190}
            adjustToWidth
            maxValue={100}
            noOfSections={4}
            hideYAxisText
            hideRules={false}
            rulesColor={colors.outlineVariant}
            rulesType="dashed"
            rulesThickness={1}
            xAxisColor={colors.outlineVariant}
            xAxisLabelTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10 }}
            pointerConfig={{
              pointerColor: colors.onSurface,
              pointerStripColor: colors.outlineVariant,
              pointerStripWidth: 1,
              showPointerStrip: true,
              activatePointersInstantlyOnTouch: true,
              pointerLabelWidth: 156,
              pointerLabelHeight: 76,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: { originalValue?: number }[]) => (
                <View style={[styles.pointerLabel, { backgroundColor: colors.elevation.level3 }]}>
                  {chartSeries.map((series, index) => {
                    const value = items[index]?.originalValue;
                    return typeof value === 'number' ? (
                      <Text key={series.metric} variant="labelSmall" style={{ color: lineColors[index] }}>
                        {getHeartRateChartMetricLabel(series.metric, language)}:{' '}
                        {formatHeartRateChartMetric(series.metric, value, language)}
                      </Text>
                    ) : null;
                  })}
                </View>
              ),
            }}
          />
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
            {labels.chartDistanceAxis}
          </Text>
          <View style={styles.legend}>
            {chartSeries.map((series, index) => (
              <View key={series.metric} style={styles.legendItem}>
                <View style={[styles.legendMarker, { backgroundColor: lineColors[index] }]} />
                <View>
                  <Text variant="labelSmall">{getHeartRateChartMetricLabel(series.metric, language)}</Text>
                  <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                    {formatHeartRateChartRange(series, language)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text variant="labelSmall" style={[styles.hint, { color: colors.onSurfaceVariant }]}>
            {labels.chartScaleHint}
          </Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 10,
  },
  state: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
  },
  title: {
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendMarker: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  pointerLabel: {
    borderRadius: 8,
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  hint: {
    textAlign: 'center',
  },
});
