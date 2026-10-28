import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { Platform, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';

export default function ProfileStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { back } = useRouter();

  return (
    <Stack
      screenOptions={{
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
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          color: colors.primary,
          fontFamily: FONT_FAMILIES.semiBold,
          fontSize: 16,
        },
        title: LABELS[language].profile,
        headerTitle:
          Platform.OS !== 'ios' ? ({ children }) => <FeedHeaderTitle>{children}</FeedHeaderTitle> : undefined,
      }}>
      <Stack.Screen
        name={`${ROUTES.profileSettings}/${ROUTES.index}`}
        options={{ title: LABELS[language].profileSettings }}
      />
      <Stack.Screen
        name={`${ROUTES.profilePrivacySettings}/${ROUTES.index}`}
        options={{ title: LABELS[language].profilePrivacySettings }}
      />
    </Stack>
  );
}
