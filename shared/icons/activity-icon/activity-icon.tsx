import { Platform } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export default function ActivityIcon({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return (
    <IconButton
      icon="run"
      iconColor={focused ? colors.primary : colors.secondary}
      size={56}
      style={{ marginTop: Platform.OS === 'ios' ? 25 : 0 }}
    />
  );
}
