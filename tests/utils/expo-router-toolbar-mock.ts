import {
  Children,
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Pressable, Text, View } from 'react-native';

interface Options {
  initiallyOpen?: boolean;
  menuTestIds?: Record<string, string>;
  renderHeaderRight?: boolean;
  onHeaderRight?: (headerRight: (() => ReactNode) | undefined) => void;
}

export function createExpoRouterToolbarMock({
  initiallyOpen = false,
  menuTestIds = {},
  renderHeaderRight = false,
  onHeaderRight,
}: Options = {}) {
  const MenuAction = ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) =>
    createElement(Pressable, { accessibilityRole: 'button', onPress }, createElement(Text, null, children));

  const Menu = ({
    children,
    icon,
    accessibilityLabel,
  }: {
    children?: ReactNode;
    icon?: string;
    accessibilityLabel?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    const actions = Children.toArray(children).filter(
      (child): child is ReactElement<{ onPress?: () => void }> =>
        isValidElement<{ onPress?: () => void }>(child) && typeof child.props.onPress === 'function',
    );

    return createElement(
      View,
      null,
      createElement(
        Pressable,
        {
          accessibilityLabel,
          accessibilityRole: 'button',
          testID: icon ? menuTestIds[icon] : undefined,
          onPress: () => setIsOpen((open) => !open),
        },
        icon ? createElement(Text, null, icon) : null,
      ),
      isOpen
        ? createElement(
            View,
            null,
            ...actions.map((action) =>
              cloneElement(action, {
                onPress: () => {
                  action.props.onPress?.();
                  setIsOpen(false);
                },
              }),
            ),
          )
        : null,
    );
  };

  const ToolbarButton = ({
    accessibilityLabel,
    children,
    icon,
    onPress,
    testID,
  }: {
    accessibilityLabel?: string;
    children?: ReactNode;
    icon?: string;
    onPress?: () => void;
    testID?: string;
  }) =>
    createElement(
      Pressable,
      { accessibilityRole: 'button', accessibilityLabel, onPress, testID },
      children ?? (icon ? createElement(Text, null, icon) : null),
    );

  const ToolbarSpacer = ({ width }: { width?: number }) => createElement(View, { style: { width } });

  const Toolbar = Object.assign(({ children }: { children?: ReactNode }) => createElement(View, null, children), {
    Button: ToolbarButton,
    Badge: ({ children }: { children?: string }) => createElement(Text, null, children),
    Menu,
    MenuAction,
    Spacer: ToolbarSpacer,
  });

  return {
    Stack: {
      Screen: ({ options, children }: { options?: { headerRight?: () => ReactNode }; children?: ReactNode }) => {
        onHeaderRight?.(options?.headerRight);
        return createElement(Fragment, null, renderHeaderRight ? options?.headerRight?.() : null, children);
      },
      Toolbar,
    },
  };
}
