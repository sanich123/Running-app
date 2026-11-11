import { StyleSheet, View } from 'react-native';
import UserSafetyMenu from '@S/moderation/user-safety-menu/user-safety-menu';
import UsersSettingsIcons from '@S/users-settings-icons/users-settings-icons';
import type { ProfileHeaderActionsProps } from './types';

export default function ProfileHeaderActions({ currentUserId, profileUserId }: ProfileHeaderActionsProps) {
  const showUserSafetyMenu = Boolean(profileUserId && currentUserId && profileUserId !== currentUserId);

  return (
    <View style={styles.layout}>
      <UsersSettingsIcons />
      {showUserSafetyMenu && profileUserId ? <UserSafetyMenu userId={profileUserId} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({ layout: { alignItems: 'center', flexDirection: 'row' } });
