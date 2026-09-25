import type { ReactNode } from 'react';
import type { MaterialDesignIconsIconName } from '@react-native-vector-icons/material-design-icons/static';

export interface SettingsRowProps {
  testID?: string;
  icon?: MaterialDesignIconsIconName;
  title: string;
  description?: string;
  onPress?: () => void;
  leading?: ReactNode;
  right?: ReactNode;
  destructive?: boolean;
}
