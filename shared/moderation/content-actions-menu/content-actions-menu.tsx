import { useState } from 'react';
import { IconButton, Menu, useTheme } from 'react-native-paper';
import type { ContentActionsMenuProps } from './types';

export default function ContentActionsMenu({
  accessibilityLabel,
  iconColor,
  testID,
  reportLabel,
  reportTestID,
  onReport,
  showReport = true,
  additionalActions,
  blockLabel,
  blockTestID,
  onBlock,
}: ContentActionsMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const { colors } = useTheme();
  const openMenu = () => {
    setHasOpened(true);
    setIsVisible(true);
  };

  return hasOpened ? (
    <Menu
      visible={isVisible}
      onDismiss={() => setIsVisible(false)}
      contentStyle={{
        backgroundColor: colors.surface,
        borderColor: colors.outlineVariant,
        borderRadius: 14,
        borderWidth: 1,
      }}
      anchor={
        <IconButton
          icon="dots-vertical"
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          testID={testID}
          onPress={openMenu}
          iconColor={iconColor ?? colors.primary}
          rippleColor={colors.primaryContainer}
          size={20}
          style={styles.trigger}
        />
      }>
      {showReport ? (
        <Menu.Item
          leadingIcon="flag-outline"
          title={reportLabel}
          dense
          rippleColor={colors.primaryContainer}
          style={styles.item}
          titleStyle={styles.menuTitle}
          testID={reportTestID}
          onPress={() => {
            setIsVisible(false);
            onReport();
          }}
        />
      ) : null}
      {additionalActions?.map((action) => (
        <Menu.Item
          key={action.testID}
          leadingIcon={action.leadingIcon}
          title={action.label}
          dense
          rippleColor={colors.primaryContainer}
          style={styles.item}
          titleStyle={[styles.menuTitle, action.destructive ? { color: colors.error } : undefined]}
          testID={action.testID}
          disabled={action.disabled}
          onPress={() => {
            setIsVisible(false);
            action.onPress();
          }}
        />
      ))}
      {onBlock && blockLabel ? (
        <Menu.Item
          leadingIcon="account-cancel-outline"
          title={blockLabel}
          dense
          rippleColor={colors.primaryContainer}
          style={styles.item}
          titleStyle={styles.menuTitle}
          testID={blockTestID}
          onPress={() => {
            setIsVisible(false);
            onBlock();
          }}
        />
      ) : null}
    </Menu>
  ) : (
    <IconButton
      icon="dots-vertical"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
      onPress={openMenu}
      iconColor={iconColor ?? colors.primary}
      rippleColor={colors.primaryContainer}
      size={20}
      style={styles.trigger}
    />
  );
}

const styles = {
  trigger: { backgroundColor: 'transparent', height: 40, margin: 0, width: 40 },
  item: { height: 40, minHeight: 40 },
  menuTitle: { fontSize: 14, lineHeight: 20 },
};
