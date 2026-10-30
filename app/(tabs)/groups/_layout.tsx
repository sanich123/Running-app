import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';

export default function GroupsLayout() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { color: colors.primary, fontFamily: FONT_FAMILIES.semiBold, fontSize: 16 },
        title: LABELS[language].groups,
      }}>
      <Stack.Screen name="index" options={{ title: LABELS[language].groups }} />
      <Stack.Screen name="create" options={{ title: language === 'russian' ? 'Создать группу' : 'Create group' }} />
      <Stack.Screen name="[groupId]" options={{ title: LABELS[language].groups }} />
      <Stack.Screen name="[groupId]/events" options={{ title: language === 'russian' ? 'События' : 'Events' }} />
    </Stack>
  );
}
