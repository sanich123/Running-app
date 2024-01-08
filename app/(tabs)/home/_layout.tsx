import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS, ROUTES } from '@const/enums';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function HomeStack() {
  const theme = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerRight: () => <UsersSettingsIcons />,
        headerTintColor: theme.colors.primaryContainer,
        title: LABELS[language].feed,
      }}>
      <Stack.Screen name={ROUTES.index} />
      <Stack.Screen name={`${ROUTES.comment}/[id]`} options={{ title: LABELS[language].comment }} />
      <Stack.Screen
        name={`${ROUTES.activity}/[id]`}
        options={{ title: LABELS[language].activity, presentation: 'modal' }}
      />
      <Stack.Screen name={`${ROUTES.followers}/[id]`} options={{ title: LABELS[language].followers }} />
      <Stack.Screen name={`${ROUTES.following}/[id]`} options={{ title: LABELS[language].followings }} />
      <Stack.Screen name={`${ROUTES.likes}/[id]`} options={{ title: LABELS[language].likes }} />
      <Stack.Screen name={`${ROUTES.map}/[id]`} options={{ title: LABELS[language].map }} />
      <Stack.Screen name={`${ROUTES.media}/[photoUrl]`} options={{ title: LABELS[language].photo }} />
      <Stack.Screen name={`${ROUTES.mediaGrid}/[id]`} options={{ title: LABELS[language].photos }} />
      <Stack.Screen name={`${ROUTES.profile}/[id]`} options={{ title: LABELS[language].profile }} />
      <Stack.Screen name="manual-activity/index" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
