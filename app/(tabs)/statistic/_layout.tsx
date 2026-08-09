import { lazy, Suspense } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
const LazyUsersSettingsIcons = lazy(() => import('@S/users-settings-icons/users-settings-icons'));

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
        headerTitle:
          Platform.OS === 'web' ? ({ children }) => <FeedHeaderTitle>{children}</FeedHeaderTitle> : undefined,
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{
          headerRight: () => (
            <Suspense fallback={null}>
              <LazyUsersSettingsIcons />
            </Suspense>
          ),
          title: LABELS[language].statistics,
        }}
      />
    </Stack>
  );
}
