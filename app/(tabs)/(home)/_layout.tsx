import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import UsersSettingsIcons from '@S/users-settings-icons/users-settings-icons';

export default function HomeStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          color: colors.primary,
          fontFamily: FONT_FAMILIES.semiBold,
          fontSize: 16,
        },
        title: LABELS[language].feed,
        headerTitle:
          Platform.OS === 'web' ? ({ children }) => <FeedHeaderTitle>{children}</FeedHeaderTitle> : undefined,
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{
          headerShown: true,
          headerRight: () => <UsersSettingsIcons showCreateActivity />,
          title: LABELS[language].feed,
        }}
      />
    </Stack>
  );
}
