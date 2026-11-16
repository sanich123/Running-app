import { Platform, View } from 'react-native';
import { usePathname } from 'expo-router';
import { ROUTES } from '@const/enums';
import { SINGLE_ACTION_ICON_SIZE } from './const';
import CreateActivityBtn from './create-activity-btn/create-activity-btn';
import NotificationsBtn from './notifications-btn/notifications-btn';
import SettingsBtn from './settings-btn/settings-btn';
import { usersSettingsIconsStyles as styles } from './styles';
import UsersBtn from './users-btn/users-btn';
import type { UsersSettingsIconsProps } from './types';

export default function UsersSettingsIcons({ showCreateActivity = false }: UsersSettingsIconsProps) {
  const pathname = usePathname();
  const isUsersPage = pathname === `/${ROUTES.users}`;
  const isSettingsPage = pathname === `/${ROUTES.settings}`;
  const isProfilePage = pathname === `/${ROUTES.profile}` || pathname.startsWith(`/${ROUTES.profile}/`);
  const isUsersIconVisible = !isUsersPage && !isProfilePage;
  const isSettingsIconVisible = !isSettingsPage;
  const visibleDestinationIconCount = Number(isUsersIconVisible) + Number(isSettingsIconVisible);
  const singleDestinationIconSize =
    Platform.OS === 'ios' && !showCreateActivity && visibleDestinationIconCount === 1
      ? SINGLE_ACTION_ICON_SIZE
      : undefined;

  return (
    <View style={styles.layout}>
      {showCreateActivity ? <CreateActivityBtn /> : null}
      {isUsersIconVisible ? <UsersBtn iconSize={singleDestinationIconSize} /> : null}
      {isSettingsIconVisible ? <SettingsBtn iconSize={singleDestinationIconSize} /> : null}
      {showCreateActivity ? <NotificationsBtn /> : null}
    </View>
  );
}
