import type { ComponentType } from 'react';
import NativeSegmentedControl from '@react-native-segmented-control/segmented-control';
import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { SegmentedControlProps } from '@react-native-segmented-control/segmented-control';

export default function SegmentedControl(props: SegmentedControlProps) {
  const NativeControl = NativeSegmentedControl as unknown as ComponentType<SegmentedControlProps>;
  if (Platform.OS !== 'ios') {
    return <NativeControl {...props} />;
  }

  const nativeStyle = { ...(props.style as unknown as ViewStyle | undefined) };
  delete nativeStyle.backgroundColor;
  delete nativeStyle.borderColor;
  delete nativeStyle.borderCurve;
  delete nativeStyle.borderRadius;
  delete nativeStyle.borderWidth;
  delete nativeStyle.height;
  delete nativeStyle.overflow;

  return <NativeControl {...props} backgroundColor={undefined} sliderStyle={undefined} style={nativeStyle} />;
}
