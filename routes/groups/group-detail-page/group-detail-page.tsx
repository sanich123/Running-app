import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import { IOS_HEADER_ITEM_SPACING, IOS_HEADER_ITEM_WIDTH_PROPS } from '@S/header-toolbar-const';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { RESPONSIVE_DIALOG_STYLE } from '@S/responsive-dialog-style';
import GroupDetailHeaderActions from './group-detail-header-actions/group-detail-header-actions';
import useGroupDetailHeaderActions from './group-detail-header-actions/use-group-detail-header-actions';
import GroupDetailTabContent from './group-detail-tab-content/group-detail-tab-content';
import GroupInfoCard from './group-info-card/group-info-card';
import useGroupDetailPage from './use-group-detail-page';

export default function GroupDetailPage() {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { copy, error, group, isActiveMember, isError, isFetching, isLoading, refetch } = useGroupDetailPage();
  const {
    copy: actionCopy,
    deleteCurrentGroup,
    isDeletingGroup,
    router,
    shareGroup,
  } = useGroupDetailHeaderActions(group);
  const { loadError, retry } = copy;
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isReportDialogVisible, setIsReportDialogVisible] = useState(false);
  const isOwner = Boolean(group && (group.isOwner || group.createdByUserId === userId));
  const canManageGroup = Boolean(group && (group.canManage || isOwner));

  return (
    <>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : isError ? (
        <ErrorComponent error={error ?? new Error(loadError)} refetch={refetch} />
      ) : !group ? (
        <View style={styles.errorState}>
          <EmptyState icon="account-group-outline" title={loadError} />
          <Button onPress={() => void refetch()}>{retry}</Button>
        </View>
      ) : (
        <>
          <Stack.Screen
            options={{
              headerRight: () =>
                Platform.OS === 'ios' ? null : (
                  <GroupDetailHeaderActions group={group} isActiveMember={isActiveMember} />
                ),
            }}>
            {Platform.OS === 'ios' ? (
              <Stack.Toolbar placement="right">
                {canManageGroup && group.privacy === 'closed' ? (
                  <Stack.Toolbar.Button
                    {...IOS_HEADER_ITEM_WIDTH_PROPS}
                    icon="person.2"
                    accessibilityLabel={actionCopy.manageRequests}
                    onPress={() => router.push(`/groups/${group.id}/requests` as never)}>
                    {group.pendingRequestCount > 0 ? (
                      <Stack.Toolbar.Badge>
                        {group.pendingRequestCount > 99 ? '99+' : `${group.pendingRequestCount}`}
                      </Stack.Toolbar.Badge>
                    ) : null}
                  </Stack.Toolbar.Button>
                ) : null}
                {canManageGroup && group.privacy === 'closed' && isActiveMember ? (
                  <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} />
                ) : null}
                {isActiveMember ? (
                  <Stack.Toolbar.Button
                    {...IOS_HEADER_ITEM_WIDTH_PROPS}
                    icon="plus"
                    accessibilityLabel={actionCopy.createContent}
                    onPress={() => router.push(`/groups/${group.id}/create-content` as never)}
                  />
                ) : null}
                {(canManageGroup && group.privacy === 'closed') || isActiveMember ? (
                  <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} />
                ) : null}
                <Stack.Toolbar.Menu
                  {...IOS_HEADER_ITEM_WIDTH_PROPS}
                  icon="ellipsis"
                  accessibilityLabel={actionCopy.groupActions}>
                  {isOwner
                    ? [
                        <Stack.Toolbar.MenuAction
                          key="share"
                          icon="square.and.arrow.up"
                          onPress={() => void shareGroup()}>
                          {actionCopy.share}
                        </Stack.Toolbar.MenuAction>,
                        <Stack.Toolbar.MenuAction
                          key="edit"
                          icon="pencil"
                          onPress={() => router.push(`/groups/${group.id}/edit` as never)}>
                          {actionCopy.editGroup}
                        </Stack.Toolbar.MenuAction>,
                        <Stack.Toolbar.MenuAction
                          key="delete"
                          icon="trash"
                          destructive
                          onPress={() => setIsDeleteDialogVisible(true)}>
                          {actionCopy.deleteGroup}
                        </Stack.Toolbar.MenuAction>,
                      ]
                    : [
                        <Stack.Toolbar.MenuAction
                          key="share"
                          icon="square.and.arrow.up"
                          onPress={() => void shareGroup()}>
                          {actionCopy.share}
                        </Stack.Toolbar.MenuAction>,
                        <Stack.Toolbar.MenuAction
                          key="report"
                          icon="flag"
                          onPress={() => setIsReportDialogVisible(true)}>
                          {actionCopy.reportGroup}
                        </Stack.Toolbar.MenuAction>,
                      ]}
                </Stack.Toolbar.Menu>
              </Stack.Toolbar>
            ) : null}
          </Stack.Screen>
          {Platform.OS === 'ios' ? (
            <>
              <Portal>
                <Dialog
                  visible={isDeleteDialogVisible}
                  onDismiss={() => setIsDeleteDialogVisible(false)}
                  style={RESPONSIVE_DIALOG_STYLE}>
                  <Dialog.Title>{actionCopy.deleteGroupTitle}</Dialog.Title>
                  <Dialog.Content>
                    <Text variant="bodyMedium">{actionCopy.deleteGroupMessage}</Text>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button
                      testID="delete-group-cancel-button"
                      onPress={() => setIsDeleteDialogVisible(false)}
                      disabled={isDeletingGroup}>
                      {actionCopy.deleteGroupCancel}
                    </Button>
                    <Button
                      testID="delete-group-confirm-button"
                      onPress={() => void deleteCurrentGroup()}
                      loading={isDeletingGroup}
                      disabled={isDeletingGroup}>
                      {actionCopy.deleteGroupConfirm}
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
              <ReportContentDialog
                visible={isReportDialogVisible}
                targetType="group"
                targetId={group.id}
                onDismiss={() => setIsReportDialogVisible(false)}
              />
            </>
          ) : null}
          <View style={[styles.page, Platform.OS === 'web' && styles.webPage, { backgroundColor: colors.background }]}>
            <GroupInfoCard group={group} isRefreshing={isFetching} />
            <GroupDetailTabContent group={group} isActiveMember={isActiveMember} />
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  errorState: { flex: 1, justifyContent: 'center' },
  page: { flex: 1, gap: 12, paddingHorizontal: 12, paddingTop: 12 },
  webPage: { alignSelf: 'center', maxWidth: MAX_MOBILE_WIDTH, width: '100%' },
});
