import { Button, HStack, Host, Image, Menu, Text } from '@expo/ui/swift-ui';
import { accessibilityLabel as accessibilityLabelModifier, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from 'react-native-paper';
import type { DateFilterMenuProps } from './types';

export default function DateFilterMenu({
  triggerLabel,
  accessibilityLabel,
  testID,
  options,
  selectedValue,
  onSelect,
}: DateFilterMenuProps) {
  const { colors } = useTheme();

  return (
    <Host matchContents seedColor={colors.primary}>
      <Menu
        label={
          <HStack
            spacing={4}
            modifiers={[accessibilityLabelModifier(accessibilityLabel), foregroundStyle(colors.primary)]}>
            <Text>{triggerLabel}</Text>
            <Image systemName="chevron.down" size={14} color={colors.primary} />
          </HStack>
        }
        testID={testID}>
        {options.map(({ label, value }) => (
          <Button
            key={`${testID}-${value ?? 'all'}`}
            label={label}
            systemImage={value === selectedValue ? 'checkmark' : undefined}
            testID={`${testID}-${value ?? 'all'}`}
            onPress={() => onSelect(value)}
          />
        ))}
      </Menu>
    </Host>
  );
}
