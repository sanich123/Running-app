import { Platform, StyleSheet, View } from 'react-native';
import { IOS_HEADER_ICON_COLOR } from '@S/header-icon-source';
import UserSafetyMenu from '@S/moderation/user-safety-menu/user-safety-menu';
import UsersSettingsIcons from '@S/users-settings-icons/users-settings-icons';
import type { ProfileHeaderActionsProps } from './types';

export default function ProfileHeaderActions({ currentUserId, profileUserId }: ProfileHeaderActionsProps) {
  const showUserSafetyMenu = Boolean(profileUserId && currentUserId && profileUserId !== currentUserId);

  return (
    <View style={styles.layout}>
      <UsersSettingsIcons />
      {showUserSafetyMenu && profileUserId ? (
        <UserSafetyMenu userId={profileUserId} iconColor={Platform.OS === 'ios' ? IOS_HEADER_ICON_COLOR : undefined} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { alignItems: 'center', flexDirection: 'row' },
});
