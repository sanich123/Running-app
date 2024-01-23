import { IconButton, useTheme } from 'react-native-paper';

export function HomeIcon({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return (
    <IconButton
      icon="home"
      iconColor={colors.primaryContainer}
      size={45}
      style={{ opacity: focused ? 1 : 0.5 }}
      animated
    />
  );
}

export function ActivityIcon({ focused }: { focused: boolean }) {
  return <IconButton icon="play" iconColor="red" size={100} animated />;
}
