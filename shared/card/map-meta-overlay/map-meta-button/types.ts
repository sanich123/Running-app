import type { ReactNode } from 'react';
import type { GestureResponderEvent } from 'react-native';

export interface MapMetaButtonProps {
  accessibilityLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  testID: string;
}
