import { StyleSheet, View } from 'react-native';
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
}: GroupMemberRowProps) {
  const { colors } = useTheme();
  const name = [member.profile?.name, member.profile?.surname].filter(Boolean).join(' ');

  return (
    <Surface style={[styles.member, { backgroundColor: colors.surface }]}>
      {rank !== undefined && (
        <Text variant="titleMedium" style={[styles.rank, { color: colors.primary }]}>
          {rank}
        </Text>
      )}
      {member.profile?.profilePhoto ? (
        <Avatar.Image size={44} source={{ uri: member.profile.profilePhoto }} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
          <Icon source="account" color={colors.primary} size={22} />
        </View>
      )}
      <View style={styles.memberInfo}>
        <Text variant="bodyLarge" numberOfLines={1} style={styles.memberName}>
          {name || copy.member}
        </Text>
        {!!member.profile?.city && <Text variant="bodySmall">{member.profile.city}</Text>}
        {distanceLabel && (
          <Text variant="bodyMedium" style={styles.distance}>
            {distanceLabel}
          </Text>
        )}
        {(member.role === 'owner' || member.role === 'admin') && (
          <Text variant="bodySmall" style={{ color: colors.primary }}>
            {member.role === 'owner' ? copy.owner : copy.admin}
          </Text>
        )}
      </View>
      {canManage && member.role !== 'owner' && (
        <View style={styles.actions}>
          {isRequest ? (
            <>
              <Button
                compact
                mode="contained"
                disabled={isUpdating}
                onPress={() => onUpdateMember(member.userId, 'active')}>
                {copy.approve}
              </Button>
              <Button compact disabled={isUpdating} onPress={() => onUpdateMember(member.userId, 'rejected')}>
                {copy.decline}
              </Button>
            </>
          ) : (
            <Button compact disabled={isUpdating} onPress={() => onUpdateMember(member.userId, 'removed')}>
              {copy.remove}
            </Button>
          )}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  member: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', gap: 12, padding: 12 },
  rank: { minWidth: 24, textAlign: 'center' },
  avatar: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontWeight: '600' },
  distance: { fontWeight: '700' },
  actions: { alignItems: 'flex-end', gap: 2 },
});
