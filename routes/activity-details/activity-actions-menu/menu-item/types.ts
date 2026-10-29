export type ActivityMenuAction = 'edit' | 'delete' | 'report' | 'gpx' | 'fit' | 'navigation';

export interface MenuItemProps {
  action: ActivityMenuAction;
  label: string;
  onPress: () => void;
  testID: string;
}
