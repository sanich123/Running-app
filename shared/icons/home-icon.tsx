import { IconButton, useTheme } from 'react-native-paper';

export default function HomeIcon({ focused }: { focused: boolean }) {
  const { colors, dark } = useTheme();
  return (
    <IconButton
      icon={focused ? 'home-outline' : 'home'}
      iconColor={focused ? colors.primary : colors.secondary}
      size={45}
      animated
      mode="outlined"
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
    />
  );
}
