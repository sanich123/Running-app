import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import type { ActivityChartAxisMenuProps } from './types';

export default function ActivityChartAxisMenu({
  side,
  axisLabel,
  options,
  selectedMetric,
  otherMetric,
  onSelect,
}: ActivityChartAxisMenuProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [selectorWidth, setSelectorWidth] = useState(0);
  const selectedOption = options.find(({ metric }) => metric === selectedMetric) ?? options[0];
  const sideSelectorStyle = side === 'right' ? styles.rightAxisSelector : undefined;
  const sideValueStyle = side === 'right' ? styles.rightAxisValue : undefined;
  const sideLabelStyle = side === 'right' ? styles.rightAxisSelectorText : undefined;

  return (
    <View style={styles.container} onLayout={({ nativeEvent }) => setSelectorWidth(nativeEvent.layout.width)}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchorPosition="bottom"
        statusBarHeight={0}
        elevation={3}
        contentStyle={[
          styles.metricMenu,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            width: selectorWidth || undefined,
          },
        ]}
        testID={`activity-chart-${side}-menu`}
        anchor={
          <TouchableRipple
            testID={`activity-chart-${side}-selector`}
            accessibilityRole="button"
            accessibilityLabel={`${axisLabel}: ${selectedOption.axisTitle}`}
            accessibilityState={{ expanded: visible }}
            onPress={() => setVisible(true)}
            style={[styles.axisSelector, sideSelectorStyle]}>
            <View testID={`activity-chart-${side}-value`} style={[styles.axisValue, sideValueStyle]}>
              <View style={[styles.metricDot, { backgroundColor: selectedOption.color }]} />
              <Text
                variant="labelLarge"
                numberOfLines={1}
                testID={`activity-chart-${side}-label`}
                style={[styles.axisSelectorText, sideLabelStyle]}>
                {selectedOption.axisTitle}
              </Text>
              <Icon source="chevron-down" size={16} color={colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>
        }>
        {options.map(({ metric, title }) => {
          const isSelected = selectedMetric === metric;
          const isDisabled = metric === otherMetric && metric !== selectedMetric;
          return (
            <Menu.Item
              key={`${side}-${metric}`}
              title={title}
              dense
              trailingIcon={isSelected ? 'check' : undefined}
              disabled={isDisabled}
              style={[styles.metricMenuItem, isSelected ? { backgroundColor: colors.secondaryContainer } : undefined]}
              titleStyle={[
                styles.metricMenuItemTitle,
                { color: isDisabled ? colors.onSurfaceVariant : colors.onSurface },
              ]}
              accessibilityState={{ selected: isSelected }}
              testID={`activity-chart-${side}-metric-${metric}`}
              onPress={() => {
                setVisible(false);
                onSelect(metric);
              }}
            />
          );
        })}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 0 },
  axisSelector: { minWidth: 0, paddingHorizontal: 10, paddingVertical: 8, width: '100%' },
  rightAxisSelector: { alignItems: 'flex-end' },
  rightAxisValue: { justifyContent: 'flex-end', width: '100%' },
  axisValue: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  rightAxisSelectorText: { textAlign: 'right' },
  axisSelectorText: { flexShrink: 1 },
  metricMenu: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 6, paddingVertical: 6 },
  metricMenuItem: { borderRadius: 8, height: 40, marginHorizontal: 2 },
  metricMenuItemTitle: { fontSize: 14, lineHeight: 20 },
  metricDot: { borderRadius: 4, height: 8, width: 8 },
});
