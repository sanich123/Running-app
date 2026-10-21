export interface ContentActionsMenuProps {
  accessibilityLabel: string;
  testID: string;
  reportLabel: string;
  reportTestID: string;
  onReport: () => void;
  blockLabel?: string;
  blockTestID?: string;
  onBlock?: () => void;
}
