import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, StyleSheet } from 'react-native';
import { Icon, IconButton, Menu, useTheme } from 'react-native-paper';
import type { TrackActionsMenuProps } from './types';

export default function TrackActionsMenu({ accessibilityLabel, testID, actions }: TrackActionsMenuProps) {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Menu
      visible={isVisible}
      onDismiss={() => setIsVisible(false)}
      elevation={3}
      contentStyle={[styles.menuSurface, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
      anchor={
        <IconButton
          icon={({ size, color }) =>
            Platform.OS === 'ios' ? (
              <SymbolView name="ellipsis" size={size} tintColor={color} />
            ) : (
              <Icon source="dots-vertical" size={size} color={color} />
            )
          }
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          testID={testID}
          onPress={() => setIsVisible(true)}
          iconColor={colors.onSurfaceVariant}
          rippleColor={colors.primaryContainer}
          size={20}
          style={styles.trigger}
        />
      }>
      {actions.map(({ label, testID: actionTestID, leadingIcon, systemImage, onPress, destructive }) => (
        <Menu.Item
          key={actionTestID}
          leadingIcon={({ size, color }) =>
            Platform.OS === 'ios' ? (
              <SymbolView name={systemImage} size={size} tintColor={color} />
            ) : (
              <Icon source={leadingIcon} size={size} color={color} />
            )
          }
          title={label}
          dense
          rippleColor={colors.primaryContainer}
          style={styles.item}
          titleStyle={[styles.menuTitle, destructive ? { color: colors.error } : undefined]}
          testID={actionTestID}
          onPress={() => {
            setIsVisible(false);
            onPress();
          }}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  trigger: { backgroundColor: 'transparent', height: 40, margin: 0, width: 40 },
  menuSurface: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 4 },
  item: { height: 40, minHeight: 40 },
  menuTitle: { fontSize: 14, lineHeight: 20 },
});
