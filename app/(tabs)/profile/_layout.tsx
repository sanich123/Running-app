import { useAuth } from '@A/context/auth-context';
import ProfileEditBtn from '@C/profile-edit-btn/profile-edit-btn';
import ProfileUpdateBtn from '@C/profile-update-btn/profile-update-btn';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS, ROUTES } from '@const/enums';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ProfileStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.primaryContainer,
        headerTitleStyle: { fontWeight: 'bold' },
        title: LABELS[language].profile,
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{
          headerRight: () => (user ? <ProfileEditBtn /> : null),
        }}
      />
      <Stack.Screen
        name={ROUTES.settings}
        options={{
          title: LABELS[language].settings,
          headerRight: () => (user ? <ProfileUpdateBtn /> : null),
        }}
      />
    </Stack>
  );
}
