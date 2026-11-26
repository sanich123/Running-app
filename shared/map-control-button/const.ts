import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

export const IOS_MAP_CONTROL_ICON_COLOR = '#000000';
export const IOS_MAP_CONTROL_BACKGROUND_COLOR = 'rgba(255, 255, 255, 0.72)';
export const IOS_MAP_CONTROL_OUTLINE_COLOR = 'rgba(0, 0, 0, 0.12)';
export const ANDROID_MAP_CONTROL_ICON_COLOR = '#202124';
export const ANDROID_MAP_CONTROL_BACKGROUND_COLOR = '#FFFFFF';
export const ANDROID_MAP_CONTROL_OUTLINE_COLOR = 'rgba(0, 0, 0, 0.12)';
export const ANDROID_MAP_CONTROL_RIPPLE_COLOR = 'rgba(0, 0, 0, 0.12)';

export const getMapControlButtonSize = (screenWidth: number) => (screenWidth < 380 ? 48 : screenWidth < 430 ? 52 : 56);
export const getMapControlButtonStyle = (size: number, backgroundColor: string, outlineColor: string): ViewStyle => ({
  alignItems: 'center',
  backgroundColor,
  borderColor: outlineColor,
  borderRadius: size / 2,
  borderWidth: StyleSheet.hairlineWidth,
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.18)',
  height: size,
  justifyContent: 'center',
  margin: 0,
  width: size,
});
