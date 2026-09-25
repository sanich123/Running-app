import type { ComponentProps } from 'react';
import type { View } from 'react-native';

export interface EmptyStateProps {
  icon: string;
  title: string;
  message?: string;
  style?: ComponentProps<typeof View>['style'];
  testID?: string;
}
