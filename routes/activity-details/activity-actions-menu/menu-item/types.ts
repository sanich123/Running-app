export type ActivityMenuAction = 'edit' | 'delete' | 'report';

export interface MenuItemProps {
  action: ActivityMenuAction;
  label: string;
  onPress: () => void;
  testID: string;
}
