import { Text } from 'react-native-paper';
import { HEALTH_CONNECT_PLAY_STORE_URL } from './const';
import { openExternalLink } from './utils';

const LINKED_PHRASES = ['Откройте Health Connect', 'Open Health Connect', 'Health Connect'];
const LINK_PATTERN = /(Откройте Health Connect|Open Health Connect|Health Connect)/g;

export function renderHealthConnectLinks(text: string, color: string) {
  return text.split(LINK_PATTERN).map((part, index) =>
    LINKED_PHRASES.includes(part) ? (
      <Text
        key={`health-connect-link-${index}`}
        accessibilityRole="link"
        onPress={() => void openExternalLink(HEALTH_CONNECT_PLAY_STORE_URL)}
        style={{ color, textDecorationLine: 'underline' }}>
        {part}
      </Text>
    ) : (
      part
    ),
  );
}
