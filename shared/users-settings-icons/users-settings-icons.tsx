import { View } from 'react-native';
import CreateActivityBtn from './create-activity-btn/create-activity-btn';
import NotificationsBtn from './notifications-btn/notifications-btn';
import SettingsBtn from './settings-btn/settings-btn';
import { usersSettingsIconsStyles as styles } from './styles';
import UsersBtn from './users-btn/users-btn';
import type { UsersSettingsIconsProps } from './types';

export default function UsersSettingsIcons({ showCreateActivity = false }: UsersSettingsIconsProps) {
  return (
    <View style={styles.layout}>
      {showCreateActivity ? <CreateActivityBtn /> : null}
      <UsersBtn />
      <SettingsBtn />
      {showCreateActivity ? <NotificationsBtn /> : null}
    </View>
  );
}
