import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Avatar, Divider, IconButton, List, Menu, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import ErrorComponent from '@S/error-component/error-component';
import { MODERATION_ACTIONS } from '../../const';
import ReportContext from '../report-context/report-context';
import type { ModerationReportDetailProps } from '../types';
import type { ModerationActionType } from '@R/services/moderation/types';

export default function ReportDetails({
  selectedReportId,
  isLoading,
  isError,
  error,
  refetch,
  reportDetails,
  selectedAppeal,
  activeTab,
  copy,
  language,
  onOpenDecision,
}: ModerationReportDetailProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false);
  const [hasOpenedActionsMenu, setHasOpenedActionsMenu] = useState(false);
  const report = reportDetails?.report;
  const context = reportDetails?.context;

  if (!selectedReportId) return <Text style={{ color: colors.onSurfaceVariant }}>{copy.selectReport}</Text>;
  if (isLoading) return <ActivityIndicator size="small" />;
  if (isError) return <ErrorComponent error={error ?? new Error(copy.loadError)} refetch={refetch} />;
  if (!report) return null;

  const moderationStatus = context?.moderationStatus;
  const mediaModerationStatus = context?.mediaStatus ?? moderationStatus;
  const contentStatus =
    moderationStatus === 'pending' ||
    moderationStatus === 'processing' ||
    moderationStatus === 'visible' ||
    moderationStatus === 'hidden' ||
    moderationStatus === 'removed'
      ? moderationStatus
      : undefined;
  const moderationActions =
    report.targetType === 'media_upload'
      ? (['approve_media', 'reject_media'] as ModerationActionType[])
      : report.targetType === 'user'
        ? MODERATION_ACTIONS.filter((action) =>
            ['warn_user', 'temporary_suspend', 'permanent_suspend', 'reject_report'].includes(action),
          )
        : MODERATION_ACTIONS.filter(
            (action) => action !== 'restore_content' || context?.moderationStatus !== 'visible',
          );
  const actionItems = moderationActions.filter((action) => {
    if (action === 'approve_media' || action === 'reject_media') return mediaModerationStatus === 'review_required';
    if (action === 'restore_content') return Boolean(contentStatus && contentStatus !== 'visible');
    if (action === 'hide_content') return contentStatus === 'visible';
    if (action === 'remove_content') return contentStatus !== 'removed';
    return true;
  });
  const hasReportActions = activeTab === 'reports' && (report.status === 'open' || report.status === 'in_review');
  const reporter = reportDetails?.reporter;
  const reporterId = reporter?.userId ?? report.reporterId;
  const reporterName = [reporter?.name, reporter?.surname].filter(Boolean).join(' ') || copy.deletedReporter;
  const contentAuthor = reportDetails?.contentAuthor;
  const contentAuthorName = [contentAuthor?.name, contentAuthor?.surname].filter(Boolean).join(' ');

  return (
    <View style={styles.content}>
      <View style={styles.detailHeader}>
        <Text variant="titleSmall">{copy.context}</Text>
        {hasOpenedActionsMenu ? (
          <Menu
            visible={isActionsMenuVisible}
            onDismiss={() => setIsActionsMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                accessibilityLabel={copy.actions}
                accessibilityRole="button"
                accessibilityState={{ expanded: isActionsMenuVisible }}
                onPress={() => setIsActionsMenuVisible(true)}
                testID={`moderation-actions-${report.id}`}
                style={styles.actionsMenuButton}
              />
            }>
            {hasReportActions
              ? actionItems.map((action) => (
                  <Menu.Item
                    key={action}
                    leadingIcon={
                      action === 'remove_content' || action === 'permanent_suspend'
                        ? 'delete-outline'
                        : 'shield-outline'
                    }
                    title={copy.action[action]}
                    testID={`moderation-action-${action}`}
                    onPress={() => {
                      setIsActionsMenuVisible(false);
                      onOpenDecision({ kind: 'action', action });
                    }}
                  />
                ))
              : null}
            {selectedAppeal?.status === 'pending'
              ? [
                  <Menu.Item
                    key={`appeal-uphold-${selectedAppeal.id}`}
                    leadingIcon="check-circle-outline"
                    title={copy.upholdAppeal}
                    testID="moderation-appeal-uphold"
                    onPress={() => {
                      setIsActionsMenuVisible(false);
                      onOpenDecision({ kind: 'appeal', appealId: selectedAppeal.id, decision: 'upheld' });
                    }}
                  />,
                  <Menu.Item
                    key={`appeal-reject-${selectedAppeal.id}`}
                    leadingIcon="close-circle-outline"
                    title={copy.rejectAppeal}
                    testID="moderation-appeal-reject"
                    onPress={() => {
                      setIsActionsMenuVisible(false);
                      onOpenDecision({ kind: 'appeal', appealId: selectedAppeal.id, decision: 'rejected' });
                    }}
                  />,
                ]
              : null}
            <Divider key={`moderation-actions-divider-${report.id}`} />
            <Menu.Item
              key={`delete-report-${report.id}`}
              leadingIcon="delete-outline"
              title={copy.deleteReport}
              testID="moderation-delete-report"
              onPress={() => {
                setIsActionsMenuVisible(false);
                onOpenDecision({ kind: 'delete-report', reportId: report.id });
              }}
            />
          </Menu>
        ) : (
          <IconButton
            icon="dots-vertical"
            accessibilityLabel={copy.actions}
            accessibilityRole="button"
            accessibilityState={{ expanded: false }}
            onPress={() => {
              setHasOpenedActionsMenu(true);
              setIsActionsMenuVisible(true);
            }}
            testID={`moderation-actions-${report.id}`}
            style={styles.actionsMenuButton}
          />
        )}
      </View>
      {reporterId ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${reporterName}${reporter?.email ? `, ${reporter.email}` : ''}`}
          onPress={() => router.push(`/profile/${reporterId}` as never)}
          style={styles.reporter}
          testID={`moderation-reporter-${report.id}`}>
          {reporter?.profilePhoto ? (
            <Avatar.Image size={44} source={{ uri: reporter.profilePhoto }} />
          ) : (
            <Avatar.Icon size={44} icon="account" />
          )}
          <View style={styles.reporterDetails}>
            <Text variant="labelMedium">{copy.reportedBy}</Text>
            <Text variant="titleSmall">{reporterName}</Text>
            {reporter?.email ? (
              <Text variant="bodySmall" selectable style={{ color: colors.onSurfaceVariant }}>
                {reporter.email}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ) : report.targetType === 'media_upload' ? (
        <View style={styles.reporter} testID={`moderation-reporter-${report.id}`}>
          <Avatar.Icon size={44} icon="robot-outline" />
          <View style={styles.reporterDetails}>
            <Text variant="labelMedium">{copy.reportSource}</Text>
            <Text variant="titleSmall">{copy.automatedReporter}</Text>
          </View>
        </View>
      ) : null}
      {!reporterId && contentAuthor ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${contentAuthorName || copy.deletedContentAuthor}${contentAuthor.email ? `, ${contentAuthor.email}` : ''}`}
          onPress={() => router.push(`/profile/${contentAuthor.userId}` as never)}
          style={styles.reporter}
          testID={`moderation-content-author-${report.id}`}>
          {contentAuthor.profilePhoto ? (
            <Avatar.Image size={44} source={{ uri: contentAuthor.profilePhoto }} />
          ) : (
            <Avatar.Icon size={44} icon="account" />
          )}
          <View style={styles.reporterDetails}>
            <Text variant="labelMedium">{copy.contentAuthor}</Text>
            <Text variant="titleSmall">{contentAuthorName || copy.deletedContentAuthor}</Text>
            {contentAuthor.email ? (
              <Text variant="bodySmall" selectable style={{ color: colors.onSurfaceVariant }}>
                {contentAuthor.email}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ) : null}
      {report.details ? (
        <View style={styles.reporterNote}>
          <Text variant="labelMedium">{copy.details}</Text>
          <Text selectable>{report.details}</Text>
        </View>
      ) : null}
      {selectedAppeal ? (
        <View style={styles.appealReason}>
          <Text variant="titleSmall">{copy.appealReason}</Text>
          <Text>{selectedAppeal.reason}</Text>
        </View>
      ) : null}
      <ReportContext report={report} context={context ?? null} copy={copy} />
      {contentStatus ? (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {copy.currentStatus}: {contentStatus === 'visible' ? copy.visible : copy[contentStatus]}
        </Text>
      ) : null}
      <Divider style={styles.divider} />
      <Text variant="titleSmall">{copy.history}</Text>
      {reportDetails?.actions.length ? (
        reportDetails.actions.map((action) => (
          <List.Item
            key={action.id}
            title={copy.action[action.action]}
            description={
              action.note ??
              new Date(action.createdAt).toLocaleString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US')
            }
            left={(props) => <List.Icon {...props} icon="history" />}
          />
        ))
      ) : (
        <Text style={{ color: colors.onSurfaceVariant }}>{copy.noHistory}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 8 },
  detailHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  actionsMenuButton: { margin: 0 },
  reporter: { alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 4 },
  reporterDetails: { flex: 1, gap: 2 },
  reporterNote: { backgroundColor: '#80808014', borderRadius: 8, gap: 4, padding: 10 },
  divider: { marginVertical: 8 },
  appealReason: { backgroundColor: '#80808014', borderRadius: 8, gap: 4, padding: 10 },
});
