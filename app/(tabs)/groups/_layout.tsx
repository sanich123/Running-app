import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { Platform, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { LABELS } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { IOS_HEADER_ICON_COLOR } from '@S/header-icon-source';

export default function GroupsLayout() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { back } = useRouter();

  return (
    <Stack
      screenOptions={({ navigation }) => ({
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: Platform.OS === 'ios' || Platform.OS === 'web' ? 'minimal' : 'default',
        headerBackVisible: Platform.OS === 'android' ? false : undefined,
        headerLeft:
          Platform.OS === 'android'
            ? ({ canGoBack, tintColor }) =>
                canGoBack ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={LABELS[language].back}
                    hitSlop={8}
                    onPress={() => back()}
                    style={{ alignItems: 'flex-start', height: 48, justifyContent: 'center', width: 32 }}>
                    <MaterialDesignIcons name="arrow-left" color={tintColor ?? colors.onSurface} size={24} />
                  </Pressable>
                ) : null
            : undefined,
        headerStyle: { backgroundColor: colors.surface },
        headerTitle:
          Platform.OS === 'android'
            ? ({ children }) => (
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.primary,
                    fontFamily: FONT_FAMILIES.semiBold,
                    fontSize: 16,
                    transform: [{ translateX: navigation.canGoBack() ? 0 : 16 }, { translateY: -2 }],
                  }}>
                  {children}
                </Text>
              )
            : undefined,
        headerTitleAlign: 'left',
        headerTintColor: Platform.OS === 'ios' ? IOS_HEADER_ICON_COLOR : colors.onSurface,
        headerTitleStyle: { color: colors.primary, fontFamily: FONT_FAMILIES.semiBold, fontSize: 16 },
        title: LABELS[language].groups,
      })}>
      <Stack.Screen name="index" options={{ title: LABELS[language].groups }} />
      <Stack.Screen name="create" options={{ title: language === 'russian' ? 'Создать группу' : 'Create group' }} />
      <Stack.Screen name="[groupId]" options={{ title: LABELS[language].groups }} />
      <Stack.Screen
        name="[groupId]/edit"
        options={{ title: language === 'russian' ? 'Изменить группу' : 'Edit group' }}
      />
      <Stack.Screen
        name="[groupId]/create-content"
        options={{ title: language === 'russian' ? 'Создать запись или событие' : 'Create a post or event' }}
      />
      <Stack.Screen
        name="[groupId]/requests"
        options={{ title: language === 'russian' ? 'Заявки в группу' : 'Join requests' }}
      />
    </Stack>
  );
}
