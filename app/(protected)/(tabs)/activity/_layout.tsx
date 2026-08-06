import { Stack } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ActivityCloseBtn from '@Routes/activity/close-btn/close-btn';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';

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
        name="index"
        options={{
          headerLeft: () => <ActivityCloseBtn />,
          headerTitle: () => <Text variant="titleLarge">{MAP_SPORT_TO_TITLE[sport][language]}</Text>,
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
