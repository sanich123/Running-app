import { StyleSheet } from 'react-native';
import type { GestureResponderEvent, ViewStyle } from 'react-native';
import {
  ANDROID_MAP_CONTROL_BACKGROUND_COLOR,
  ANDROID_MAP_CONTROL_ICON_COLOR,
  ANDROID_MAP_CONTROL_OUTLINE_COLOR,
} from '@S/map-control-button/const';

export const IOS_ACTIVITY_HEADER_ICON_COLOR = '#000000';
export const ANDROID_ACTIVITY_HEADER_ICON_COLOR = ANDROID_MAP_CONTROL_ICON_COLOR;
export const ACTIVITY_HEADER_BUTTON_SIZE = 40;
export const ANDROID_ACTIVITY_HEADER_BACKGROUND_COLOR = ANDROID_MAP_CONTROL_BACKGROUND_COLOR;
export const ANDROID_ACTIVITY_HEADER_OUTLINE_COLOR = ANDROID_MAP_CONTROL_OUTLINE_COLOR;
export const ACTIVITY_TRACKING_ERROR_COPY = {
  start: 'Не удалось запустить отслеживание геопозиции',
  stop: 'Не удалось остановить отслеживание геопозиции',
  pause: 'Не удалось поставить отслеживание на паузу',
} as const;

export const getActivityHeaderButtonStyle = (backgroundColor: string, outlineColor: string): ViewStyle => ({
  alignItems: 'center',
  backgroundColor,
  borderColor: outlineColor,
  borderRadius: ACTIVITY_HEADER_BUTTON_SIZE / 2,
  borderWidth: StyleSheet.hairlineWidth,
  height: ACTIVITY_HEADER_BUTTON_SIZE,
  justifyContent: 'center',
  overflow: 'hidden',
  width: ACTIVITY_HEADER_BUTTON_SIZE,
});

export const isActivityHeaderButtonTap = (event: GestureResponderEvent) => {
  const { locationX, locationY } = event.nativeEvent;
  const center = ACTIVITY_HEADER_BUTTON_SIZE / 2;

  return (locationX - center) ** 2 + (locationY - center) ** 2 <= center ** 2;
};
