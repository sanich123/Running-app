import ActivityCloseBtn from '@C/activity/close-btn/close-btn';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ActivityStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.secondaryContainer },
        headerTintColor: colors.primaryContainer,
        headerTitleStyle: { fontWeight: 'bold' },
        title: '',
      }}>
      <Stack.Screen name="index" options={{ headerLeft: () => <ActivityCloseBtn /> }} />
    </Stack>
  );
}
