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
      <Stack.Screen name={ROUTES.index} />
    </Stack>
  );
}
