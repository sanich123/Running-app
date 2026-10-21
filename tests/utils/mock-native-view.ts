import { createElement, type ReactNode, type Ref } from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

export interface MockNativeViewProps extends Record<string, unknown> {
  children?: ReactNode;
}

export function createMockNativeView(
  props: Record<string, unknown>,
  children?: ReactNode,
  testID?: string,
  ref?: Ref<unknown>,
) {
  return createElement(View, { testID, ...props, ref } as unknown as ViewProps, children);
}
