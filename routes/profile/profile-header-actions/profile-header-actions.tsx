import { StyleSheet, View } from 'react-native';
import UserSafetyMenu from '@S/moderation/user-safety-menu/user-safety-menu';
import UsersSettingsIcons from '@S/users-settings-icons/users-settings-icons';

export default function ProfileHeaderActions({
  currentUserId,
  profileUserId,
}: {
  currentUserId?: string;
  profileUserId?: string;
}) {
  const showUserSafetyMenu = Boolean(profileUserId && currentUserId && profileUserId !== currentUserId);

  return (
    <View style={styles.layout}>
      <UsersSettingsIcons />
      {showUserSafetyMenu && profileUserId ? <UserSafetyMenu userId={profileUserId} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({ layout: { alignItems: 'center', flexDirection: 'row' } });
