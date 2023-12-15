import { ROUTES } from '@const/enums';
import { Stack } from 'expo-router';

export default function ProgressStack() {
  return (
    <Stack>
      <Stack.Screen name={ROUTES.index} options={{ headerShown: false }} />
    </Stack>
  );
}
