import type { ReactNode } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export interface SettingsRowProps {
  testID?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  onPress?: () => void;
  leading?: ReactNode;
  right?: ReactNode;
  destructive?: boolean;
}
