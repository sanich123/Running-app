import type { ReactNode } from 'react';
import { createElement } from 'react';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform } from 'react-native';

export const HEADER_ICON_SIZE = 24;

export function getHeaderIconSource(
  androidIcon: string,
  iosSymbol: SFSymbol,
  iosTintColor: string,
  iosIconSize = HEADER_ICON_SIZE,
) {
  return Platform.OS === 'ios'
    ? (): ReactNode =>
        createElement(SymbolView, {
          name: iosSymbol,
          size: iosIconSize,
          tintColor: iosTintColor,
          weight: 'medium',
        })
    : androidIcon;
}
