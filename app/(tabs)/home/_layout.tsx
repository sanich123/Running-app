import { ROUTES } from '@const/enums';
import { Stack } from 'expo-router';

export default function HomeStack() {
  return (
    <Stack>
      <Stack.Screen name={ROUTES.index} options={{ headerShown: false }} />
      <Stack.Screen name={`${ROUTES.comment}/[id]`} />
      <Stack.Screen name={`${ROUTES.activity}/[id]`} />
      <Stack.Screen name={`${ROUTES.followers}/[id]`} />
      <Stack.Screen name={`${ROUTES.following}/[id]`} />
      <Stack.Screen name={`${ROUTES.likes}/[id]`} />
      <Stack.Screen name={`${ROUTES.map}/[id]`} />
      <Stack.Screen name={`${ROUTES.media}/[photoUrl]`} />
      <Stack.Screen name={`${ROUTES.mediaGrid}/[id]`} />
      <Stack.Screen name={`${ROUTES.profile}/[id]`} />
    </Stack>
  );
}
