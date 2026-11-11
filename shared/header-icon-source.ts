import type { ReactNode } from 'react';
import { createElement } from 'react';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform } from 'react-native';

export const HEADER_ICON_SIZE = 24;
export const IOS_HEADER_ICON_COLOR = '#000000';

export function getHeaderIconSource(androidIcon: string, iosSymbol: SFSymbol) {
  return Platform.OS === 'ios'
    ? (): ReactNode =>
        createElement(SymbolView, {
          name: iosSymbol,
          size: HEADER_ICON_SIZE,
          tintColor: IOS_HEADER_ICON_COLOR,
          weight: 'medium',
        })
    : androidIcon;
}
