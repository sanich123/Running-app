import { IconButton, useTheme } from 'react-native-paper';

export function HomeIcon({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return (
    <IconButton
      icon="home"
      iconColor={colors.primaryContainer}
      size={focused ? 55 : 50}
      style={{ opacity: focused ? 1 : 0.5, paddingTop: 13 }}
      animated
    />
  );
}

export function ActivityIcon({ focused }: { focused: boolean }) {
  return <IconButton icon="play" iconColor="red" size={focused ? 100 : 80} animated style={[{ paddingTop: 10 }]} />;
}
