import type { ViewStyle } from 'react-native';

export const getMapControlButtonSize = (screenWidth: number) => (screenWidth < 380 ? 48 : screenWidth < 430 ? 52 : 56);
export const MAP_CONTROL_BUTTON_BACKGROUND = 'rgba(255, 255, 255, 0.30)';
export const getMapControlButtonStyle = (size: number): ViewStyle => ({
  alignItems: 'center',
  backgroundColor: MAP_CONTROL_BUTTON_BACKGROUND,
  borderRadius: size / 2,
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.18)',
  height: size,
  justifyContent: 'center',
  margin: 0,
  width: size,
});
