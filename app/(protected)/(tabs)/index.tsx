import Feed from '@C/home-page/home-page';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { LABELS } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function HomePage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.secondaryContainer },
          headerTintColor: colors.onSurfaceVariant,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <UsersSettingsIcons />,
          title: LABELS[language].feed,
        }}
      />
      <Feed />
    </>
  );
}
