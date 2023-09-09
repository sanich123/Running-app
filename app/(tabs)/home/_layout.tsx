import { Stack } from 'expo-router';

export default function HomeStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="comment/[id]" />
      <Stack.Screen name="activity/[id]" />
      <Stack.Screen name="followers/[id]" />
      <Stack.Screen name="following/[id]" />
      <Stack.Screen name="likes/[id]" />
      <Stack.Screen name="map/[id]" />
      <Stack.Screen name="media/[id]" />
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
