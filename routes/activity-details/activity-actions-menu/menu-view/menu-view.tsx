import { useState } from 'react';
import { IconButton, Menu, useTheme } from 'react-native-paper';
import { ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import { ActivityActionsMenuDismissContext } from './context';
import type { MenuViewProps } from './types';

export default function MenuView({ accessibilityLabel, children }: MenuViewProps) {
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
          size={20}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ expanded: isVisible }}
          testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.trigger}
          onPress={openMenu}
          iconColor={colors.primary}
          rippleColor={colors.primaryContainer}
          style={[styles.trigger, { backgroundColor: colors.surface }]}
        />
      }>
      <ActivityActionsMenuDismissContext.Provider value={() => setIsVisible(false)}>
        {children}
      </ActivityActionsMenuDismissContext.Provider>
    </Menu>
  ) : (
    <IconButton
      icon="dots-vertical"
      size={20}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded: isVisible }}
      testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.trigger}
      onPress={openMenu}
      iconColor={colors.primary}
      rippleColor={colors.primaryContainer}
      style={[styles.trigger, { backgroundColor: colors.surface }]}
    />
  );
}

const styles = {
  trigger: { backgroundColor: 'transparent', height: 40, margin: 0, width: 40 },
};
