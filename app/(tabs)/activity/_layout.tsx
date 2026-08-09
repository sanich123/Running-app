import { lazy, Suspense } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import FeedHeaderTitle from '@Routes/feed-header-title/feed-header-title';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';

const LazyActivityCloseBtn = lazy(() => import('@Routes/activity/close-btn/close-btn'));

export default function ActivityStack() {
  const { sport } = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surfaceVariant },
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{
          headerLeft: () => (
            <Suspense fallback={null}>
              <LazyActivityCloseBtn />
            </Suspense>
          ),
          headerTitle: () =>
            Platform.OS === 'web' ? (
              <FeedHeaderTitle>{MAP_SPORT_TO_TITLE[sport][language]}</FeedHeaderTitle>
            ) : (
              <Text variant="titleLarge">{MAP_SPORT_TO_TITLE[sport][language]}</Text>
            ),
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
