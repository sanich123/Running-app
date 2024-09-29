import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS, ROUTES } from '@const/enums';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function StatisticsStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.secondaryContainer },
        headerTintColor: colors.onSurfaceVariant,
        headerTitleStyle: { fontWeight: 'bold' },
        title: Platform.OS !== 'web' ? LABELS[language].statistics : '',
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].statistics }}
      />
      <Stack.Screen
        name={`${ROUTES.monthStatistic}/${ROUTES.index}`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].statistics }}
      />
      <Stack.Screen
        name={`${ROUTES.activity}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].activity }}
      />
      <Stack.Screen
        name={`${ROUTES.activitiesList}/[...ids]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].activities }}
      />
    </Stack>
  );
}
