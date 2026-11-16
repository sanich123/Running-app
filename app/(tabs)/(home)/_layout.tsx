import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import { IOS_HEADER_ITEM_SPACING, IOS_HEADER_ITEM_WIDTH_PROPS } from '@S/header-toolbar-const';
import useCreateActivityAction from '@S/users-settings-icons/create-activity-btn/use-create-activity-action';
import { NOTIFICATIONS_OVERFLOW_LABEL } from '@S/users-settings-icons/notifications-btn/const';
import useNotificationsButton from '@S/users-settings-icons/notifications-btn/use-notifications-button';
import UsersSettingsIcons from '@S/users-settings-icons/users-settings-icons';

export default function HomeStack() {
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { push } = useRouter();
  const createActivity = useCreateActivityAction();
  const { unreadCount, openNotifications } = useNotificationsButton(Platform.OS === 'ios');
  const labels = LABELS[language];

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerUserInterfaceStyle: dark ? 'dark' : 'light',
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
        }}>
        {Platform.OS === 'ios' ? (
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="plus"
              accessibilityLabel={labels.createActivity}
              onPress={createActivity}
            />
            <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} />
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="person.2"
              accessibilityLabel={labels.users}
              onPress={() => push(`/${ROUTES.users}`)}
            />
            <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} />
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="gearshape"
              accessibilityLabel={labels.settings}
              onPress={() => push(`/${ROUTES.settings}`)}
            />
            <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} />
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="bell"
              accessibilityLabel={labels.notifications}
              onPress={openNotifications}>
              {unreadCount > 0 ? (
                <Stack.Toolbar.Badge>
                  {unreadCount > 99 ? NOTIFICATIONS_OVERFLOW_LABEL : `${unreadCount}`}
                </Stack.Toolbar.Badge>
              ) : null}
            </Stack.Toolbar.Button>
          </Stack.Toolbar>
        ) : null}
      </Stack.Screen>
    </Stack>
  );
}
