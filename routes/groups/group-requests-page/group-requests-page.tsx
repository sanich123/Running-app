import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetGroupByIdQuery, useGetGroupMembersQuery, useUpdateGroupMemberMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import { GROUPS_COPY } from '../const';
import GroupMemberRow from '../group-member-row/group-member-row';

export default function GroupRequestsPage() {
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { loadError, noRequestsPage, requestsPageTitle, retry, saveError } = GROUPS_COPY[language];
  const {
    data: group,
    isLoading: isGroupLoading,
    isError: isGroupError,
    refetch,
  } = useGetGroupByIdQuery(groupId ?? '', { skip: !groupId });
  const isGroupOwner = Boolean(group && (group.isOwner || (userId && group.createdByUserId === userId)));
  const canManageGroup = Boolean(group?.canManage || isGroupOwner);
  const groupName = group?.name;
  const { data: requests = [], isLoading: areRequestsLoading } = useGetGroupMembersQuery(
    { groupId: groupId ?? '', status: 'pending' },
    { skip: !groupId || !canManageGroup },
  );
  const [updateMember, { isLoading: isUpdating }] = useUpdateGroupMemberMutation();

  const updateRequest = async (userId: string, status: 'active' | 'rejected' | 'removed') => {
    if (!groupId) return;
    try {
      await updateMember({ groupId, userId, status }).unwrap();
    } catch (error) {
      errorToast(saveError, error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: requestsPageTitle }} />
      {isGroupLoading || areRequestsLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : isGroupError || !group || !canManageGroup ? (
        <View style={styles.feedback}>
          <EmptyState icon="account-group-outline" title={loadError} />
          <Button onPress={() => refetch()}>{retry}</Button>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, Platform.OS === 'web' && styles.webContent]}
          style={{ backgroundColor: colors.background }}>
          <Text variant="headlineSmall" style={styles.title}>
            {groupName}
          </Text>
          {requests.length ? (
            requests.map(({ userId: memberId, ...member }) => (
              <GroupMemberRow
                key={memberId}
                member={{ userId: memberId, ...member }}
                isRequest
                canManage
                isUpdating={isUpdating}
                onUpdateMember={updateRequest}
                copy={GROUPS_COPY[language]}
                language={language}
              />
            ))
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {noRequestsPage}
            </Text>
          )}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  feedback: { flex: 1, justifyContent: 'center' },
  content: { gap: 10, padding: 12, paddingBottom: 24 },
  webContent: { alignSelf: 'center', maxWidth: MAX_MOBILE_WIDTH, width: '100%' },
  title: { fontWeight: '700', marginBottom: 2 },
});
