import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Button, Icon, Surface, Text, useTheme } from 'react-native-paper';
import type { GroupMemberRowProps } from './types';

export default function GroupMemberRow({
  member,
  copy,
  canManage,
  isRequest = false,
  isUpdating,
  onUpdateMember,
  rank,
  distanceLabel,
  onPressProfile,
}: GroupMemberRowProps) {
  const { member: memberCopy, owner, admin, approve, decline, remove } = copy;
  const { colors } = useTheme();
  const { userId, role, profile } = member;
  const { name: firstName, surname, city, profilePhoto } = profile ?? {};
  const name = [firstName, surname].filter(Boolean).join(' ');

  return (
    <Surface style={[styles.member, { backgroundColor: colors.surface }]}>
      {rank !== undefined ? (
        <Text variant="titleMedium" style={[styles.rank, { color: colors.primary }]}>
          {rank}
        </Text>
      ) : null}
      <Pressable
        accessibilityLabel={onPressProfile ? name || memberCopy : undefined}
        accessibilityRole={onPressProfile ? 'button' : undefined}
        disabled={!onPressProfile}
        onPress={onPressProfile}
        style={styles.profile}
        testID={onPressProfile ? `group-member-profile-${userId}` : undefined}>
        {profilePhoto ? (
          <Avatar.Image size={44} source={{ uri: profilePhoto }} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="account" color={colors.primary} size={22} />
          </View>
        )}
        <View style={styles.memberInfo}>
          <Text variant="bodyLarge" numberOfLines={1} style={styles.memberName}>
            {name || memberCopy}
          </Text>
          {city ? <Text variant="bodySmall">{city}</Text> : null}
          {distanceLabel ? (
            <Text variant="bodyMedium" style={styles.distance}>
              {distanceLabel}
            </Text>
          ) : null}
          {role === 'owner' || role === 'admin' ? (
            <Text variant="bodySmall" style={{ color: colors.primary }}>
              {role === 'owner' ? owner : admin}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {canManage && onUpdateMember && role !== 'owner' ? (
        <View style={styles.actions}>
          {isRequest ? (
            <>
              <Button compact mode="contained" disabled={isUpdating} onPress={() => onUpdateMember(userId, 'active')}>
                {approve}
              </Button>
              <Button compact disabled={isUpdating} onPress={() => onUpdateMember(userId, 'rejected')}>
                {decline}
              </Button>
            </>
          ) : (
            <Button compact disabled={isUpdating} onPress={() => onUpdateMember(userId, 'removed')}>
              {remove}
            </Button>
          )}
        </View>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  member: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', gap: 12, padding: 12 },
  profile: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12 },
  rank: { minWidth: 24, textAlign: 'center' },
  avatar: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontWeight: '600' },
  distance: { fontWeight: '700' },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 4 },
});
