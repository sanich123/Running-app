import { Button, HStack, Host, Image, Menu, Text } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  disabled,
  frame,
  foregroundStyle,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { useTheme } from 'react-native-paper';
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
  const selectedOption = options.find(({ metric }) => metric === selectedMetric) ?? options[0];

  return (
    <Host matchContents={{ horizontal: false, vertical: true }} seedColor={colors.primary} style={{ flex: 1 }}>
      <Menu
        testID={`activity-chart-${side}-selector`}
        label={
          <HStack
            testID={`activity-chart-${side}-value`}
            spacing={4}
            modifiers={[
              accessibilityLabelModifier(`${axisLabel}: ${selectedOption.axisTitle}`),
              foregroundStyle(colors.primary),
              padding({ horizontal: 10, vertical: 8 }),
              frame({ maxWidth: Infinity, alignment: side === 'right' ? 'trailing' : 'leading' }),
            ]}>
            <Image systemName="circle.fill" size={8} color={selectedOption.color} />
            <Text
              testID={`activity-chart-${side}-label`}
              modifiers={side === 'right' ? [accessibilityLabelModifier(selectedOption.axisTitle)] : undefined}>
              {selectedOption.axisTitle}
            </Text>
            <Image systemName="chevron.down" size={12} color={colors.onSurfaceVariant} />
          </HStack>
        }>
        {options.map(({ metric, title }) => (
          <Button
            key={`${side}-${metric}`}
            label={title}
            systemImage={selectedMetric === metric ? 'checkmark' : undefined}
            modifiers={metric === otherMetric && metric !== selectedMetric ? [disabled(true)] : undefined}
            testID={`activity-chart-${side}-metric-${metric}`}
            onPress={() => onSelect(metric)}
          />
        ))}
      </Menu>
    </Host>
  );
}
