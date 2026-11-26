import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import ErrorComponent from '@S/error-component/error-component';
import GroupMemberRow from '../../../group-member-row/group-member-row';
import useGroupMembersList from './use-group-members-list';
import type { GroupDetails } from '@R/services/groups/types';

export default function GroupMembersList({ group }: { group: GroupDetails }) {
  const {
    canManageGroup,
    canSeeMembers,
    changeMember,
    copy,
    error,
    isError,
    isLoading,
    isUpdatingMember,
    language,
    members,
    onScroll,
    openProfile,
    refetch,
  } = useGroupMembersList(group);
  const { loadError, noMembers } = copy;

  return canSeeMembers ? (
    <ScrollView
      contentContainerStyle={styles.listContent}
      onScroll={onScroll}
      scrollEventThrottle={200}
      testID="group-detail-scroll">
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
  emptyText: { alignSelf: 'center', flex: 1, marginTop: 12, textAlign: 'center', textAlignVertical: 'center' },
});
