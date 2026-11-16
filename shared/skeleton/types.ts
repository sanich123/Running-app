import type { ComponentProps } from 'react';
import type { View } from 'react-native';

export interface SkeletonProps {
  style?: ComponentProps<typeof View>['style'];
  testID?: string;
}
