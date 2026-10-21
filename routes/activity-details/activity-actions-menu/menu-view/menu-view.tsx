import { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import { ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import { ActivityActionsMenuDismissContext } from './context';
import type { MenuViewProps } from './types';

export default function MenuView({ accessibilityLabel, children }: MenuViewProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Menu
      visible={isVisible}
      onDismiss={() => setIsVisible(false)}
      anchor={
        <IconButton
          icon="dots-vertical"
          size={24}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ expanded: isVisible }}
          testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.trigger}
          onPress={() => setIsVisible(true)}
        />
      }>
      <ActivityActionsMenuDismissContext.Provider value={() => setIsVisible(false)}>
        {children}
      </ActivityActionsMenuDismissContext.Provider>
    </Menu>
  );
}
