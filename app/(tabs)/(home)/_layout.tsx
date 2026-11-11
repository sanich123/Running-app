import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import { IOS_HEADER_ICON_COLOR } from '@S/header-icon-source';
import UsersSettingsIcons from '@S/users-settings-icons/users-settings-icons';

export default function HomeStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: Platform.OS === 'ios' ? IOS_HEADER_ICON_COLOR : colors.onSurface,
        headerTitleStyle: {
          color: colors.primary,
          fontFamily: FONT_FAMILIES.semiBold,
          fontSize: 16,
        },
        title: 'RUNICH',
        headerTitle: () => <FeedHeaderTitle isBrand />,
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{
          headerShown: true,
          headerRight: () => <UsersSettingsIcons showCreateActivity />,
          title: 'RUNICH',
        }}
      />
    </Stack>
  );
}
