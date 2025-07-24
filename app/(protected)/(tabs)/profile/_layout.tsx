import ProfileEditBtn from '@C/profile/edit-btn/edit-btn';
import ProfileUpdateBtn from '@C/profile/update-btn/update-btn';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS, ROUTES } from '@const/enums';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ProfileStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.secondaryContainer },
        headerTintColor: colors.onSurfaceVariant,
        headerTitleStyle: { fontWeight: 'bold' },
        title: LABELS[language].profile,
      }}>
      <Stack.Screen
        name={`${ROUTES.index}`}
        options={{
          headerRight: () => userId && <ProfileEditBtn />,
        }}
      />
      <Stack.Screen
        name={`${ROUTES.profileSettings}/index`}
        options={{
          title: LABELS[language].profileSettings,
          headerRight: () => userId && <ProfileUpdateBtn />,
        }}
      />
    </Stack>
  );
}
