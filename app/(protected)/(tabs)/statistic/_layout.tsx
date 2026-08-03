import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { LABELS, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function StatisticsStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surfaceVariant },
        headerTintColor: colors.onSurfaceVariant,
        headerTitleStyle: { fontWeight: 'bold' },
        title: Platform.OS !== 'web' ? LABELS[language].statistics : '',
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].statistics }}
      />
    </Stack>
  );
}
