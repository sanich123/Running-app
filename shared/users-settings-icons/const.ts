import type { GestureResponderEvent, ViewStyle } from 'react-native';

export const SINGLE_ACTION_BUTTON_SIZE = 48;
export const SINGLE_ACTION_ICON_SIZE = 28;

export const getSingleActionButtonStyle = (dark: boolean): ViewStyle => ({
  backgroundColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)',
  borderColor: dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: dark ? 0 : 0.08,
  shadowRadius: 3,
});

export function isSingleActionButtonPress(event: GestureResponderEvent) {
  const radius = SINGLE_ACTION_BUTTON_SIZE / 2;
  const { locationX, locationY } = event.nativeEvent;

  return (locationX - radius) ** 2 + (locationY - radius) ** 2 <= radius ** 2;
}
