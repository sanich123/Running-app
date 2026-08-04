import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import ProfileEditBtn from '@C/profile/edit-btn/edit-btn';
import ProfileUpdateBtn from '@C/profile/update-btn/update-btn';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';

export default function ProfileStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontFamily: FONT_FAMILIES.extraBold, fontSize: 15 },
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
