export interface TrackActionsMenuAction {
  label: string;
  testID: string;
  leadingIcon: 'pencil-outline' | 'file-download-outline' | 'delete-outline';
  systemImage: 'pencil' | 'arrow.down.doc' | 'trash';
  onPress: () => void;
  destructive?: boolean;
}

export interface TrackActionsMenuProps {
  accessibilityLabel: string;
  testID: string;
  actions: TrackActionsMenuAction[];
}
