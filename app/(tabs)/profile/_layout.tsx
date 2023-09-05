import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ProfileStack() {
  const {
    colors: { primaryContainer, primary },
  } = useTheme();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          title: '',
          headerTintColor: primaryContainer,
          headerTitleStyle: { fontWeight: 'bold' },
          headerStyle: { backgroundColor: primary },
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
