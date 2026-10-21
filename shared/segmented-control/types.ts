import type { ViewStyle } from 'react-native';

declare module '@react-native-segmented-control/segmented-control' {
  interface SegmentedControlProps {
    testIDS?: string[];
    sliderStyle?: ViewStyle;
  }
}
