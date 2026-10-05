import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { useGlobalActivitySportParams } from '@Routes/activity/activity-params';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';

export default function ActivityStack() {
  const { language } = useAppSelector(({ settings }) => settings);
  const { sport } = useGlobalActivitySportParams();
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surfaceVariant },
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{
          headerShown: true,
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
