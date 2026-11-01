import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

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
