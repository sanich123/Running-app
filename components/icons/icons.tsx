import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export function HomeIcon({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name="home" color={colors.primaryContainer} size={focused ? 40 : 35} />;
}

export function ActivityIcon({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="record-circle-outline" color={colors.primaryContainer} size={focused ? 40 : 35} />
  );
}

export function ProgressIcon({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name="chart-bar" color={colors.primaryContainer} size={focused ? 40 : 35} />;
}
