import { Platform } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export function HomeIcon({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return (
    <IconButton
      icon={focused ? 'home-outline' : 'home'}
      iconColor={colors.primaryContainer}
      size={focused ? 55 : 45}
      animated
    />
  );
}

export function ActivityIcon({ focused }: { focused: boolean }) {
  return (
    <IconButton icon="play" iconColor="red" size={100} animated style={{ marginTop: Platform.OS === 'ios' ? 25 : 0 }} />
  );
}
