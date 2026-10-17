import { Button } from '@expo/ui/swift-ui';
import { ACTIVITY_MENU_ITEM_ICONS } from './const';
import type { MenuItemProps } from './types';

export default function MenuItem({ action, label, onPress, testID }: MenuItemProps) {
  return (
    <Button
      label={label}
      systemImage={ACTIVITY_MENU_ITEM_ICONS[action].swiftUI}
      role={action === 'delete' ? 'destructive' : 'default'}
      testID={testID}
      onPress={onPress}
    />
  );
}
