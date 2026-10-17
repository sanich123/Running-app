import { Host, Menu } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';
import { ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import type { MenuViewProps } from './types';

export default function MenuView({ accessibilityLabel, children }: MenuViewProps) {
  return (
    <Host matchContents>
      <Menu
        label={accessibilityLabel}
        systemImage="ellipsis"
        modifiers={[labelStyle('iconOnly')]}
        testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.trigger}>
        {children}
      </Menu>
    </Host>
  );
}
