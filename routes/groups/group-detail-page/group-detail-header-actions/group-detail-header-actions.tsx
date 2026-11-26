import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Dialog, IconButton, Menu, Portal, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { RESPONSIVE_DIALOG_STYLE } from '@S/responsive-dialog-style';
import useGroupDetailHeaderActions from './use-group-detail-header-actions';
import type { GroupDetailHeaderActionsProps } from './types';

export default function GroupDetailHeaderActions({ group, isActiveMember }: GroupDetailHeaderActionsProps) {
  const { copy, deleteCurrentGroup, isDeletingGroup, router, shareGroup } = useGroupDetailHeaderActions(group);
  const {
    manageRequests,
    createContent,
    groupActions,
    share,
    editGroup,
    deleteGroup,
    reportGroup,
    deleteGroupTitle,
    deleteGroupMessage,
    deleteGroupCancel,
    deleteGroupConfirm,
  } = copy;
  const { userId } = useAppSelector(({ auth }) => auth);
  const { id, privacy, pendingRequestCount, canManage, isOwner: groupIsOwner, createdByUserId } = group;
  const isOwner = groupIsOwner || createdByUserId === userId;
  const canManageGroup = canManage || isOwner;
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isReportDialogVisible, setIsReportDialogVisible] = useState(false);

  return (
    <>
      <View style={styles.actions}>
        {canManageGroup && privacy === 'closed' ? (
          <View>
            <IconButton
              icon="account-clock-outline"
              accessibilityLabel={manageRequests}
              onPress={() => router.push(`/groups/${id}/requests` as never)}
              style={styles.headerActionButton}
              testID="group-requests-header-button"
            />
            {pendingRequestCount > 0 ? (
              <Badge style={styles.requestBadge}>{pendingRequestCount > 99 ? '99+' : pendingRequestCount}</Badge>
            ) : null}
          </View>
        ) : null}
        {isActiveMember ? (
          <IconButton
            icon="plus"
            accessibilityLabel={createContent}
            testID="group-create-content-header-button"
            onPress={() => router.push(`/groups/${id}/create-content` as never)}
            style={styles.headerActionButton}
          />
        ) : null}
        <Menu
          visible={isMenuVisible}
          onDismiss={() => setIsMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              accessibilityLabel={groupActions}
              onPress={() => setIsMenuVisible(true)}
              style={styles.headerActionButton}
            />
          }>
          <Menu.Item
            leadingIcon="share-variant"
            onPress={() => {
              setIsMenuVisible(false);
              void shareGroup();
            }}
            title={share}
          />
          {isOwner ? (
            <>
              <Menu.Item
                leadingIcon="pencil-outline"
                onPress={() => {
                  setIsMenuVisible(false);
                  router.push(`/groups/${id}/edit` as never);
                }}
                title={editGroup}
              />
              <Menu.Item
                leadingIcon="delete-outline"
                onPress={() => {
                  setIsMenuVisible(false);
                  setIsDeleteDialogVisible(true);
                }}
                title={deleteGroup}
              />
            </>
          ) : (
            <Menu.Item
              leadingIcon="flag-outline"
              onPress={() => {
                setIsMenuVisible(false);
                setIsReportDialogVisible(true);
              }}
              title={reportGroup}
            />
          )}
        </Menu>
      </View>
      <Portal>
        <Dialog
          visible={isDeleteDialogVisible}
          onDismiss={() => setIsDeleteDialogVisible(false)}
          style={RESPONSIVE_DIALOG_STYLE}>
          <Dialog.Title>{deleteGroupTitle}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{deleteGroupMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              testID="delete-group-cancel-button"
              onPress={() => setIsDeleteDialogVisible(false)}
              disabled={isDeletingGroup}>
              {deleteGroupCancel}
            </Button>
            <Button
              testID="delete-group-confirm-button"
              onPress={() => void deleteCurrentGroup()}
              loading={isDeletingGroup}
              disabled={isDeletingGroup}>
              {deleteGroupConfirm}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <ReportContentDialog
        visible={isReportDialogVisible}
        targetType="group"
        targetId={id}
        onDismiss={() => setIsReportDialogVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row' },
  headerActionButton: { margin: 0 },
  requestBadge: { position: 'absolute', right: 2, top: 2 },
});
