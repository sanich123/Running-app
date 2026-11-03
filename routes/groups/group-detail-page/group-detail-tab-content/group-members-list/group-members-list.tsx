import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, SegmentedButtons, Text } from 'react-native-paper';
import ErrorComponent from '@S/error-component/error-component';
import useGroupMembersList from './use-group-members-list';
import GroupMemberRow from '../../../group-member-row/group-member-row';
import type { GroupDetails } from '@R/services/groups/types';

export default function GroupMembersList({ group, isActiveMember }: { group: GroupDetails; isActiveMember: boolean }) {
  const {
    canManageGroup,
    canSeeMembers,
    changeMember,
    changePreferences,
    copy,
    error,
    isError,
    isLoading,
    isUpdatingMember,
    isUpdatingPreferences,
    language,
    members,
    membership,
    onScroll,
    openProfile,
    refetch,
  } = useGroupMembersList(group);
  const {
    notifications,
    allNotifications,
    announcementNotifications,
    notificationsOff,
    feedPreference,
    allGroupPosts,
    adminPostsOnly,
    loadError,
    noMembers,
  } = copy;

  return canSeeMembers ? (
    <ScrollView
      contentContainerStyle={styles.listContent}
      onScroll={onScroll}
      scrollEventThrottle={200}
      testID="group-detail-scroll">
      {isActiveMember && membership ? (
        <View style={styles.preferences}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {notifications}
          </Text>
          <SegmentedButtons
            value={membership.notificationPreference ?? 'all'}
            onValueChange={(value) => void changePreferences('notificationPreference', value)}
            buttons={[
              { value: 'all', label: allNotifications, disabled: isUpdatingPreferences },
              { value: 'announcements', label: announcementNotifications, disabled: isUpdatingPreferences },
              { value: 'off', label: notificationsOff, disabled: isUpdatingPreferences },
            ]}
          />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {feedPreference}
          </Text>
          <SegmentedButtons
            value={membership.feedPreference ?? 'all'}
            onValueChange={(value) => void changePreferences('feedPreference', value)}
            buttons={[
              { value: 'all', label: allGroupPosts, disabled: isUpdatingPreferences },
              { value: 'admins', label: adminPostsOnly, disabled: isUpdatingPreferences },
            ]}
          />
        </View>
      ) : null}
      {isLoading ? (
        <ActivityIndicator />
      ) : isError ? (
        <ErrorComponent error={error ?? new Error(loadError)} refetch={refetch} />
      ) : members.length ? (
        members.map(({ userId, role, status, joinedAt, profile }) => (
          <GroupMemberRow
            key={userId}
            member={{ userId, role, status, joinedAt, profile }}
            canManage={canManageGroup}
            isUpdating={isUpdatingMember}
            onUpdateMember={changeMember}
            copy={copy}
            language={language}
            onPressProfile={() => openProfile(userId)}
          />
        ))
      ) : (
        <Text variant="bodyMedium" style={styles.emptyText}>
          {noMembers}
        </Text>
      )}
    </ScrollView>
  ) : (
    <View />
  );
}

const styles = StyleSheet.create({
  listContent: { flexGrow: 1, gap: 10, paddingBottom: 24 },
  preferences: { gap: 10 },
  sectionTitle: { fontWeight: '700', marginBottom: 2 },
  emptyText: { alignSelf: 'center', flex: 1, marginTop: 12, textAlign: 'center', textAlignVertical: 'center' },
});
