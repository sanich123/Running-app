import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';

export default function StatisticsStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          color: colors.primary,
          fontFamily: FONT_FAMILIES.semiBold,
          fontSize: 16,
        },
        title: Platform.OS !== 'web' ? LABELS[language].statistics : '',
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].statistics }}
      />
    </Stack>
  );
}
