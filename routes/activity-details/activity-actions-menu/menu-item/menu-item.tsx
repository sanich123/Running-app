import { useContext } from 'react';
import { Menu, useTheme } from 'react-native-paper';
import { ACTIVITY_MENU_ITEM_ICONS } from './const';
import { ActivityActionsMenuDismissContext } from '../menu-view/context';
import type { MenuItemProps } from './types';

export default function MenuItem({ action, label, onPress, testID }: MenuItemProps) {
  const { colors } = useTheme();
  const dismissMenu = useContext(ActivityActionsMenuDismissContext);

  return (
    <Menu.Item
      title={label}
      leadingIcon={ACTIVITY_MENU_ITEM_ICONS[action].paper}
      dense
      rippleColor={colors.primaryContainer}
      style={styles.item}
      titleStyle={action === 'delete' ? { color: colors.error } : undefined}
      testID={testID}
      onPress={() => {
        dismissMenu();
        onPress();
      }}
    />
  );
}

const styles = {
  item: { minHeight: 40, height: 40 },
};
