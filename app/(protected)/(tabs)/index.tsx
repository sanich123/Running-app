import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import Feed from '@C/home-page/home-page';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { LABELS } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';

export default function HomePage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerTitleStyle: {
            color: colors.primary,
            fontFamily: FONT_FAMILIES.semiBold,
            fontSize: 16,
          },
          headerRight: () => <UsersSettingsIcons />,
          title: LABELS[language].feed,
        }}
      />
      <Feed />
    </>
  );
}
