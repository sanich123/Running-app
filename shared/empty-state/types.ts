import type { StyleProp, ViewStyle } from 'react-native';

export interface EmptyStateProps {
  icon: string;
  title: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
