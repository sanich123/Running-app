export type ActivityMenuAction = 'edit' | 'delete';

export interface MenuItemProps {
  action: ActivityMenuAction;
  label: string;
  onPress: () => void;
  testID: string;
}
