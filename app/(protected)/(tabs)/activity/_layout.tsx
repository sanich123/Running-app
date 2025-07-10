import ActivityCloseBtn from '@C/activity/close-btn/close-btn';

import { useAppSelector } from '@R/typed-hooks';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { Stack } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';

export default function ActivityStack() {
  const {
    additionalInfo: { sport },
  } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.secondaryContainer },
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
