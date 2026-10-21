import { createElement } from 'react';
import type { ReactNode } from 'react';
import { Text } from 'react-native-paper';
import { HEALTH_CONNECT_PLAY_STORE_URL } from '../const';
import { openExternalLink } from '../utils';
import { HEALTH_CONNECT_LINK_PATTERN, HEALTH_CONNECT_LINK_PHRASES } from './const';

export function renderHealthConnectLinks(text: string, color: string): ReactNode[] {
  return text.split(HEALTH_CONNECT_LINK_PATTERN).map((part, index) =>
    HEALTH_CONNECT_LINK_PHRASES.includes(part)
      ? createElement(Text, {
          key: `health-connect-link-${index}`,
          children: part,
          accessibilityRole: 'link',
          onPress: () => void openExternalLink(HEALTH_CONNECT_PLAY_STORE_URL),
          style: { color, textDecorationLine: 'underline' },
        })
      : part,
  );
}
