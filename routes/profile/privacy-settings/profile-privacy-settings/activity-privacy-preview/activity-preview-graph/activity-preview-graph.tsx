import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { PROFILE_PRIVACY_SETTINGS } from '../../../const';
import type { ActivityPrivacyMetric } from '../types';
import type { ActivityPreviewGraphProps } from './types';

export default function ActivityPreviewGraph({ language, visibleMetrics }: ActivityPreviewGraphProps) {
  const { colors } = useTheme();
  const copy = PROFILE_PRIVACY_SETTINGS[language];
  const showGraph = visibleMetrics.length >= 2;
  const [selectedLeftMetric, setSelectedLeftMetric] = useState<ActivityPrivacyMetric>('heartRate');
  const [selectedRightMetric, setSelectedRightMetric] = useState<ActivityPrivacyMetric>('pace');
  const leftMetric = visibleMetrics.find(({ key }) => key === selectedLeftMetric) ?? visibleMetrics[0];
  const rightMetric =
    visibleMetrics.find(({ key }) => key === selectedRightMetric && key !== leftMetric?.key) ??
    visibleMetrics.find(({ key }) => key !== leftMetric?.key);
  const selectedMetrics = visibleMetrics.filter(({ key }) => key === leftMetric?.key || key === rightMetric?.key);

  return (
    <View
      testID="privacy-activity-preview-graph"
      style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Text variant="labelLarge">{copy.activityPreviewGraphTitle}</Text>
      {showGraph ? (
        <>
          <View style={styles.axisSelectors}>
            {[leftMetric, rightMetric].map((metric, index) => (
              <TouchableRipple
                key={index === 0 ? 'left' : 'right'}
                testID={`privacy-activity-preview-axis-${index === 0 ? 'left' : 'right'}`}
                accessibilityRole="button"
                accessibilityLabel={`${index === 0 ? copy.activityPreviewAxisLeft : copy.activityPreviewAxisRight}: ${metric?.label ?? ''}`}
                onPress={() => {
                  if (index === 0 && rightMetric) {
                    const availableMetrics = visibleMetrics.filter(({ key }) => key !== rightMetric.key);
                    const currentIndex = availableMetrics.findIndex(({ key }) => key === leftMetric?.key);
                    setSelectedLeftMetric(availableMetrics[(currentIndex + 1) % availableMetrics.length].key);
                  } else if (index === 1 && leftMetric) {
                    const availableMetrics = visibleMetrics.filter(({ key }) => key !== leftMetric.key);
                    const currentIndex = availableMetrics.findIndex(({ key }) => key === rightMetric?.key);
                    setSelectedRightMetric(availableMetrics[(currentIndex + 1) % availableMetrics.length].key);
                  }
                }}
                style={[styles.axisButton, { borderColor: colors.outlineVariant }]}>
                <View style={styles.axisButtonContent}>
                  <View style={[styles.metricDot, { backgroundColor: metric?.color }]} />
                  <Text variant="labelMedium" numberOfLines={1} style={styles.axisButtonLabel}>
                    {metric?.label}
                  </Text>
                  <Icon source="chevron-down" size={16} color={colors.onSurfaceVariant} />
                </View>
              </TouchableRipple>
            ))}
          </View>
          <View style={[styles.chartPlot, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}>
            {selectedMetrics.map(({ key, label, color }) => (
              <View key={key} style={styles.chartLineRow}>
                <Text variant="labelSmall" style={styles.chartLineLabel}>
                  {label}
                </Text>
                <View style={[styles.chartLine, { backgroundColor: color }]} />
              </View>
            ))}
            <View style={[styles.chartTimeAxis, { backgroundColor: colors.outlineVariant }]} />
          </View>
        </>
      ) : (
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          {copy.activityPreviewGraphHidden}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: 8, borderWidth: 1, gap: 8, padding: 8 },
  axisSelectors: { flexDirection: 'row', gap: 6 },
  axisButton: {
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 6,
  },
  axisButtonContent: { alignItems: 'center', flexDirection: 'row', gap: 5, width: '100%' },
  metricDot: { borderRadius: 4, height: 8, width: 8 },
  axisButtonLabel: { flex: 1 },
  chartPlot: { borderRadius: 6, borderWidth: 1, gap: 8, minHeight: 70, justifyContent: 'center', padding: 8 },
  chartLineRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  chartLineLabel: { width: 58 },
  chartLine: { borderRadius: 4, flex: 1, height: 4 },
  chartTimeAxis: { height: StyleSheet.hairlineWidth, marginTop: 4, width: '100%' },
});
