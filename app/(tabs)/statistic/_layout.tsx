import { Suspense } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { LazyUsersSettingsIcons } from '@Routes/app-routes/const';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';

export default function StatisticsStack() {
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
