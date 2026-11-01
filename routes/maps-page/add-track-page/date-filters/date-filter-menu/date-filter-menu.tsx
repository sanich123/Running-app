import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
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
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      elevation={3}
      contentStyle={[styles.menuSurface, { backgroundColor: colors.surface }]}
      anchor={
        <TouchableRipple
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          borderless={false}
          hitSlop={0}
          onPress={() => setVisible(true)}
          rippleColor={colors.primaryContainer}
          style={[styles.trigger, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
          testID={testID}>
          <View style={styles.triggerContent}>
            <Text variant="labelLarge" numberOfLines={1} style={[styles.triggerLabel, { color: colors.primary }]}>
              {triggerLabel}
            </Text>
            <Icon source="chevron-down" size={18} color={colors.onSurfaceVariant} />
          </View>
        </TouchableRipple>
      }>
      {options.map(({ label: optionLabel, value }) => (
        <Menu.Item
          key={`${testID}-${value ?? 'all'}`}
          testID={`${testID}-${value ?? 'all'}`}
          title={optionLabel}
          trailingIcon={value === selectedValue ? 'check' : undefined}
          dense
          style={styles.item}
          onPress={() => {
            setVisible(false);
            onSelect(value);
          }}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  menuSurface: { borderRadius: 16, minWidth: 176, paddingVertical: 4 },
  item: { minHeight: 32 },
  trigger: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  triggerContent: { alignItems: 'center', flexDirection: 'row', gap: 4, minHeight: 38, paddingHorizontal: 10 },
  triggerLabel: { fontSize: 13, lineHeight: 18 },
});
