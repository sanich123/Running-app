import { useState } from 'react';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ACTIVITY_TIME_CHART_LAYOUT } from './const';
import { HOME_ACTIVITY_FULL_VIEW } from '../../metrics/const';
import {
  buildActivityChartPath,
  ACTIVITY_CHART_METRIC_COLORS,
  formatActivityChartAxisValue,
  getActivityChartAxisTicks,
  getActivityChartXCoordinate,
  getActivityChartYCoordinate,
  getDefaultActivityChartAxes,
  getHeartRateZone,
  HEART_RATE_ZONE_COLORS,
} from '../utils';
import type { ActivityChartMetric, ActivityTimeChartProps } from '../types';

export default function ActivityTimeChart({ chartSeries, zoneSettings, language }: ActivityTimeChartProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const labels = HOME_ACTIVITY_FULL_VIEW[language];
  const chartWidth = Math.max(230, Math.min(width, MAX_MOBILE_WIDTH) - 34);
  const { height, top, bottom, left, right, gridLineCount } = ACTIVITY_TIME_CHART_LAYOUT;
  const plotWidth = chartWidth - left - right;
  const plotHeight = height - top - bottom;
  const plotBottom = top + plotHeight;
  const defaultAxes = getDefaultActivityChartAxes(chartSeries);
  const [selectedLeftMetric, setSelectedLeftMetric] = useState<ActivityChartMetric | null>(null);
  const [selectedRightMetric, setSelectedRightMetric] = useState<ActivityChartMetric | null>(null);
  const [visibleMenu, setVisibleMenu] = useState<'left' | 'right' | null>(null);
  const [hasOpenedLeftMenu, setHasOpenedLeftMenu] = useState(false);
  const [hasOpenedRightMenu, setHasOpenedRightMenu] = useState(false);
  const [leftSelectorWidth, setLeftSelectorWidth] = useState(0);
  const [rightSelectorWidth, setRightSelectorWidth] = useState(0);
  const leftMetric =
    chartSeries.find(({ metric }) => metric === selectedLeftMetric)?.metric ??
    defaultAxes.leftMetric ??
    chartSeries[0].metric;
  const rightMetric =
    chartSeries.find(({ metric }) => metric === selectedRightMetric)?.metric ??
    defaultAxes.rightMetric ??
    chartSeries[0].metric;
  const leftSeries = chartSeries.find(({ metric }) => metric === leftMetric) ?? chartSeries[0];
  const rightSeries = chartSeries.find(({ metric }) => metric === rightMetric) ?? chartSeries[0];
  const heartRateSeries = chartSeries.find(({ metric }) => metric === 'heartRate');
  const displayedSeries = [leftSeries, rightSeries].filter(
    (series, index, selectedSeries) => selectedSeries.findIndex(({ metric }) => metric === series.metric) === index,
  );
  const heartRateTicks = getActivityChartAxisTicks(leftSeries, leftSeries.metric);
  const rightTicks = getActivityChartAxisTicks(rightSeries, rightSeries.metric);
  const leftMinimum =
    leftSeries.metric === 'heartRate' && leftSeries.minValue === leftSeries.maxValue
      ? leftSeries.minValue - 4
      : leftSeries.minValue;
  const leftMaximum = leftSeries.maxValue;
  const rightMinimum =
    rightSeries.metric === 'heartRate' && rightSeries.minValue === rightSeries.maxValue
      ? rightSeries.minValue - 4
      : rightSeries.minValue;
  const rightMaximum = rightSeries.maxValue;
  const timeTicks = leftSeries.data.flatMap((point, index) => (point.label ? [{ point, index }] : []));
  const metricOptions = chartSeries.map(({ metric }) => ({
    metric,
    title:
      metric === 'heartRate'
        ? labels.heartRate
        : metric === 'pace'
          ? labels.pace
          : metric === 'speed'
            ? labels.speed
            : labels.chartElevation,
    axisTitle:
      metric === 'heartRate'
        ? labels.heartRateAxisLabel
        : metric === 'pace'
          ? labels.paceAxisLabel
          : metric === 'speed'
            ? labels.speedAxisLabel
            : labels.elevationAxisLabel,
  }));
  const leftOption = metricOptions.find(({ metric }) => metric === leftMetric) ?? metricOptions[0];
  const rightOption = metricOptions.find(({ metric }) => metric === rightMetric) ?? metricOptions[0];
  const defaultSelectorWidth = chartWidth / (metricOptions.length > 1 ? 2 : 1);

  return (
    <>
      <View style={[styles.axisSelectors, { borderColor: colors.outlineVariant }]}>
        <View
          style={styles.axisSelectorColumn}
          onLayout={({ nativeEvent }) => setLeftSelectorWidth(nativeEvent.layout.width)}>
          {hasOpenedLeftMenu ? (
            <Menu
              visible={visibleMenu === 'left'}
              onDismiss={() => setVisibleMenu(null)}
              anchorPosition="bottom"
              elevation={3}
              contentStyle={[
                styles.metricMenu,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outlineVariant,
                  width: leftSelectorWidth || defaultSelectorWidth,
                },
              ]}
              testID="activity-chart-left-menu"
              anchor={
                <TouchableRipple
                  testID="activity-chart-left-selector"
                  accessibilityRole="button"
                  accessibilityLabel={`${labels.chartLeftAxis}: ${leftOption.axisTitle}`}
                  accessibilityState={{ expanded: visibleMenu === 'left' }}
                  onPress={() => setVisibleMenu('left')}
                  style={styles.axisSelector}>
                  <View style={styles.axisSelectorContent}>
                    <View testID="activity-chart-left-value" style={styles.axisValue}>
                      <View style={[styles.metricDot, { backgroundColor: ACTIVITY_CHART_METRIC_COLORS[leftMetric] }]} />
                      <Text variant="labelLarge" numberOfLines={1} style={styles.axisSelectorText}>
                        {leftOption.axisTitle}
                      </Text>
                      <Icon source="chevron-down" size={16} color={colors.onSurfaceVariant} />
                    </View>
                  </View>
                </TouchableRipple>
              }>
              {metricOptions.map(({ metric, title }) => {
                const isSelected = leftMetric === metric;
                const isDisabled = metric === rightMetric && metric !== leftMetric;
                return (
                  <Menu.Item
                    key={`left-${metric}`}
                    title={title}
                    dense
                    trailingIcon={isSelected ? 'check' : undefined}
                    disabled={isDisabled}
                    style={[
                      styles.metricMenuItem,
                      isSelected ? { backgroundColor: colors.secondaryContainer } : undefined,
                    ]}
                    titleStyle={[
                      styles.metricMenuItemTitle,
                      { color: isDisabled ? colors.onSurfaceVariant : colors.onSurface },
                    ]}
                    accessibilityState={{ selected: isSelected }}
                    testID={`activity-chart-left-metric-${metric}`}
                    onPress={() => {
                      setSelectedLeftMetric(metric);
                      setVisibleMenu(null);
                    }}
                  />
                );
              })}
            </Menu>
          ) : (
            <TouchableRipple
              testID="activity-chart-left-selector"
              accessibilityRole="button"
              accessibilityLabel={`${labels.chartLeftAxis}: ${leftOption.axisTitle}`}
              accessibilityState={{ expanded: visibleMenu === 'left' }}
              onPress={() => {
                setHasOpenedLeftMenu(true);
                setVisibleMenu('left');
              }}
              style={styles.axisSelector}>
              <View style={styles.axisSelectorContent}>
                <View testID="activity-chart-left-value" style={styles.axisValue}>
                  <View style={[styles.metricDot, { backgroundColor: ACTIVITY_CHART_METRIC_COLORS[leftMetric] }]} />
                  <Text variant="labelLarge" numberOfLines={1} style={styles.axisSelectorText}>
                    {leftOption.axisTitle}
                  </Text>
                  <Icon source="chevron-down" size={16} color={colors.onSurfaceVariant} />
                </View>
              </View>
            </TouchableRipple>
          )}
        </View>
        {metricOptions.length > 1 ? (
          <View
            style={styles.axisSelectorColumn}
            onLayout={({ nativeEvent }) => setRightSelectorWidth(nativeEvent.layout.width)}>
            {hasOpenedRightMenu ? (
              <Menu
                visible={visibleMenu === 'right'}
                onDismiss={() => setVisibleMenu(null)}
                anchorPosition="bottom"
                elevation={3}
                contentStyle={[
                  styles.metricMenu,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outlineVariant,
                    width: rightSelectorWidth || defaultSelectorWidth,
                  },
                ]}
                testID="activity-chart-right-menu"
                anchor={
                  <TouchableRipple
                    testID="activity-chart-right-selector"
                    accessibilityRole="button"
                    accessibilityLabel={`${labels.chartRightAxis}: ${rightOption.axisTitle}`}
                    accessibilityState={{ expanded: visibleMenu === 'right' }}
                    onPress={() => setVisibleMenu('right')}
                    style={[styles.axisSelector, styles.rightAxisSelector]}>
                    <View style={[styles.axisSelectorContent, styles.rightAxisSelectorContent]}>
                      <View testID="activity-chart-right-value" style={[styles.axisValue, styles.rightAxisValue]}>
                        <View
                          style={[styles.metricDot, { backgroundColor: ACTIVITY_CHART_METRIC_COLORS[rightMetric] }]}
                        />
                        <Text
                          variant="labelLarge"
                          numberOfLines={1}
                          testID="activity-chart-right-label"
                          style={[styles.axisSelectorText, styles.rightAxisSelectorText]}>
                          {rightOption.axisTitle}
                        </Text>
                        <Icon source="chevron-down" size={16} color={colors.onSurfaceVariant} />
                      </View>
                    </View>
                  </TouchableRipple>
                }>
                {metricOptions.map(({ metric, title }) => {
                  const isSelected = rightMetric === metric;
                  const isDisabled = metric === leftMetric && metric !== rightMetric;
                  return (
                    <Menu.Item
                      key={`right-${metric}`}
                      title={title}
                      dense
                      trailingIcon={isSelected ? 'check' : undefined}
                      disabled={isDisabled}
                      style={[
                        styles.metricMenuItem,
                        isSelected ? { backgroundColor: colors.secondaryContainer } : undefined,
                      ]}
                      titleStyle={[
                        styles.metricMenuItemTitle,
                        { color: isDisabled ? colors.onSurfaceVariant : colors.onSurface },
                      ]}
                      accessibilityState={{ selected: isSelected }}
                      testID={`activity-chart-right-metric-${metric}`}
                      onPress={() => {
                        setSelectedRightMetric(metric);
                        setVisibleMenu(null);
                      }}
                    />
                  );
                })}
              </Menu>
            ) : (
              <TouchableRipple
                testID="activity-chart-right-selector"
                accessibilityRole="button"
                accessibilityLabel={`${labels.chartRightAxis}: ${rightOption.axisTitle}`}
                accessibilityState={{ expanded: visibleMenu === 'right' }}
                onPress={() => {
                  setHasOpenedRightMenu(true);
                  setVisibleMenu('right');
                }}
                style={[styles.axisSelector, styles.rightAxisSelector]}>
                <View style={[styles.axisSelectorContent, styles.rightAxisSelectorContent]}>
                  <View testID="activity-chart-right-value" style={[styles.axisValue, styles.rightAxisValue]}>
                    <View style={[styles.metricDot, { backgroundColor: ACTIVITY_CHART_METRIC_COLORS[rightMetric] }]} />
                    <Text
                      variant="labelLarge"
                      numberOfLines={1}
                      testID="activity-chart-right-label"
                      style={[styles.axisSelectorText, styles.rightAxisSelectorText]}>
                      {rightOption.axisTitle}
                    </Text>
                    <Icon source="chevron-down" size={16} color={colors.onSurfaceVariant} />
                  </View>
                </View>
              </TouchableRipple>
            )}
          </View>
        ) : null}
      </View>
      <View style={styles.chart}>
        <Svg testID="activity-chart-plot" width={chartWidth} height={height}>
          {Array.from({ length: gridLineCount }, (_, index) => {
            const y = top + (plotHeight * index) / (gridLineCount - 1);
            return (
              <Line
                key={`grid-${index}`}
                x1={left}
                x2={chartWidth - right}
                y1={y}
                y2={y}
                stroke={colors.outlineVariant}
                strokeWidth={1}
                strokeDasharray="3 4"
              />
            );
          })}
          <Line x1={left} x2={left} y1={top} y2={plotBottom} stroke={colors.outlineVariant} strokeWidth={1} />
          {metricOptions.length > 1 ? (
            <Line
              x1={chartWidth - right}
              x2={chartWidth - right}
              y1={top}
              y2={plotBottom}
              stroke={colors.outlineVariant}
              strokeWidth={1}
            />
          ) : null}
          {heartRateTicks.map((tick, index) => {
            const y = top + (plotHeight * index) / (gridLineCount - 1);
            return (
              <SvgText
                key={`left-axis-${index}`}
                x={left - 6}
                y={y + 3}
                fill={colors.onSurfaceVariant}
                fontSize={10}
                textAnchor="end">
                {formatActivityChartAxisValue(leftSeries.metric, tick, language)}
              </SvgText>
            );
          })}
          {metricOptions.length > 1
            ? rightTicks.map((tick, index) => {
                const y = top + (plotHeight * index) / (gridLineCount - 1);
                return (
                  <SvgText
                    key={`right-axis-${index}`}
                    x={chartWidth - right + 6}
                    y={y + 3}
                    fill={colors.onSurfaceVariant}
                    fontSize={10}
                    textAnchor="start">
                    {formatActivityChartAxisValue(rightSeries.metric, tick, language)}
                  </SvgText>
                );
              })
            : null}
          {timeTicks.map(({ point, index }, tickIndex) => {
            const x = getActivityChartXCoordinate(index, leftSeries.data.length, plotWidth, left);
            const textAnchor = tickIndex === 0 ? 'start' : tickIndex === timeTicks.length - 1 ? 'end' : 'middle';
            return (
              <SvgText
                key={`time-axis-${index}`}
                x={x}
                y={height - 5}
                fill={colors.onSurfaceVariant}
                fontSize={10}
                textAnchor={textAnchor}>
                {point.label}
              </SvgText>
            );
          })}
          {displayedSeries
            .filter(({ metric }) => metric !== 'heartRate')
            .map((series) => {
              const isLeftSeries = series.metric === leftSeries.metric;
              const minimum = isLeftSeries ? leftMinimum : rightMinimum;
              const maximum = isLeftSeries ? leftMaximum : rightMaximum;
              return (
                <Path
                  key={`series-${series.metric}`}
                  testID={`activity-chart-series-${series.metric}`}
                  d={buildActivityChartPath(series, minimum, maximum, plotWidth, plotHeight, left, top)}
                  fill="none"
                  stroke={ACTIVITY_CHART_METRIC_COLORS[series.metric]}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
          {displayedSeries.some(({ metric }) => metric === 'heartRate') && heartRateSeries
            ? heartRateSeries.data.slice(1).map((point, index) => {
                const previous = heartRateSeries.data[index];
                const isLeftAxis = leftSeries.metric === 'heartRate';
                const minimum = isLeftAxis ? leftMinimum : rightMinimum;
                const maximum = isLeftAxis ? leftMaximum : rightMaximum;
                const x1 = getActivityChartXCoordinate(index, heartRateSeries.data.length, plotWidth, left);
                const x2 = getActivityChartXCoordinate(index + 1, heartRateSeries.data.length, plotWidth, left);
                const y1 = getActivityChartYCoordinate(
                  previous.originalValue,
                  'heartRate',
                  minimum,
                  maximum,
                  top,
                  plotHeight,
                );
                const y2 = getActivityChartYCoordinate(
                  point.originalValue,
                  'heartRate',
                  minimum,
                  maximum,
                  top,
                  plotHeight,
                );
                const zone = getHeartRateZone((previous.originalValue + point.originalValue) / 2, zoneSettings);
                return (
                  <Path
                    key={`heart-rate-zone-${index}`}
                    testID={`activity-chart-heart-rate-zone-${index + 1}`}
                    d={`M ${x1} ${y1} L ${x2} ${y2}`}
                    fill="none"
                    stroke={HEART_RATE_ZONE_COLORS[zone - 1]}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })
            : null}
        </Svg>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  axisSelectors: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  axisSelector: {
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
  },
  axisSelectorColumn: {
    flex: 1,
    minWidth: 0,
  },
  rightAxisSelector: {
    alignItems: 'flex-end',
  },
  axisSelectorContent: {
    gap: 3,
  },
  rightAxisSelectorContent: {
    alignItems: 'flex-end',
    width: '100%',
  },
  axisValue: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  rightAxisValue: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  axisSelectorText: {
    flexShrink: 1,
  },
  rightAxisSelectorText: {
    textAlign: 'right',
  },
  metricMenu: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  metricMenuItem: {
    borderRadius: 8,
    height: 40,
    marginHorizontal: 2,
  },
  metricMenuItemTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  metricDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  chart: {
    alignItems: 'center',
    overflow: 'hidden',
  },
});
