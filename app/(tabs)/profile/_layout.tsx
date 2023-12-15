import { ROUTES } from '@const/enums';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ProfileStack() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen name={ROUTES.index} options={{ headerShown: false }} />
      <Stack.Screen
        name={ROUTES.settings}
        options={{
          title: '',
          headerTintColor: colors.primaryContainer,
          headerTitleStyle: { fontWeight: 'bold' },
          headerStyle: { backgroundColor: colors.primary },
        }}
      />
    </Stack>
  );
}
