import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import UserSafetyMenu from '@S/moderation/user-safety-menu/user-safety-menu';
import UsersSettingsIcons from '@S/users-settings-icons/users-settings-icons';
import type { ProfileHeaderActionsProps } from './types';

export default function ProfileHeaderActions({ currentUserId, profileUserId }: ProfileHeaderActionsProps) {
  const { colors } = useTheme();
  const showUserSafetyMenu = Boolean(profileUserId && currentUserId && profileUserId !== currentUserId);

  return (
    <View style={styles.layout}>
      <UsersSettingsIcons />
      {showUserSafetyMenu && profileUserId ? (
        <UserSafetyMenu userId={profileUserId} iconColor={Platform.OS === 'ios' ? colors.onSurface : undefined} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { alignItems: 'center', flexDirection: 'row' },
});
