export interface ContentActionsMenuItem {
  label: string;
  testID: string;
  leadingIcon: string;
  systemImage: 'pencil' | 'trash';
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ContentActionsMenuProps {
  accessibilityLabel: string;
  iconColor?: string;
  testID: string;
  reportLabel: string;
  reportTestID: string;
  onReport: () => void;
  showReport?: boolean;
  additionalActions?: ContentActionsMenuItem[];
  blockLabel?: string;
  blockTestID?: string;
  onBlock?: () => void;
}
