import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Divider, List, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import ErrorComponent from '@S/error-component/error-component';
import { MODERATION_ACTIONS } from '../../const';
import ReportContext from '../report-context/report-context';
import type { PendingDecision } from '../../types';
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
  const { colors } = useTheme();
  const report = reportDetails?.report;
  const context = reportDetails?.context;

  if (!selectedReportId) return <Text style={{ color: colors.onSurfaceVariant }}>{copy.selectReport}</Text>;
  if (isLoading) return <ActivityIndicator size="small" />;
  if (isError) return <ErrorComponent error={error ?? new Error(copy.loadError)} refetch={refetch} />;
  if (!report) return null;

  const targetType = copy.targetType[report.targetType];
  const moderationStatus = context?.moderationStatus;
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
    if (action === 'approve_media' || action === 'reject_media') return context?.moderationStatus === 'review_required';
    if (action === 'restore_content') return Boolean(contentStatus && contentStatus !== 'visible');
    if (action === 'hide_content') return contentStatus === 'visible';
    if (action === 'remove_content') return contentStatus !== 'removed';
    return true;
  });

  return (
    <View style={styles.content}>
      <Text variant="titleMedium">
        {targetType} · {copy.status[report.status]}
      </Text>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {copy.reportId}: {report.id}
      </Text>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {copy.targetId}: {report.targetId}
      </Text>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {copy.reportedAt}:{' '}
        {new Date(report.createdAt).toLocaleString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US')}
      </Text>
      <Divider style={styles.divider} />
      <Text variant="titleSmall">{copy.reasons[report.reason]}</Text>
      {report.details ? (
        <Text>
          {copy.details}: {report.details}
        </Text>
      ) : null}
      {selectedAppeal ? (
        <View style={styles.appealReason}>
          <Text variant="titleSmall">{copy.appealReason}</Text>
          <Text>{selectedAppeal.reason}</Text>
        </View>
      ) : null}
      <Divider style={styles.divider} />
      <Text variant="titleSmall">{copy.context}</Text>
      <ReportContext report={report} context={context ?? null} copy={copy} />
      {contentStatus ? (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {copy.currentStatus}: {contentStatus === 'visible' ? copy.visible : copy[contentStatus]}
        </Text>
      ) : null}
      {selectedAppeal?.status === 'pending' ? (
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() =>
              onOpenDecision({
                kind: 'appeal',
                appealId: selectedAppeal.id,
                decision: 'upheld',
              } satisfies PendingDecision)
            }
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}>
            {copy.upholdAppeal}
          </Button>
          <Button
            mode="outlined"
            onPress={() =>
              onOpenDecision({
                kind: 'appeal',
                appealId: selectedAppeal.id,
                decision: 'rejected',
              } satisfies PendingDecision)
            }
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}>
            {copy.rejectAppeal}
          </Button>
        </View>
      ) : null}
      {activeTab === 'reports' && (report.status === 'open' || report.status === 'in_review') ? (
        <>
          <Divider style={styles.divider} />
          <Text variant="titleSmall">{copy.actions}</Text>
          <View style={styles.actionButtons}>
            {actionItems.map((action) => (
              <Button
                key={action}
                mode={action === 'remove_content' || action === 'permanent_suspend' ? 'outlined' : 'contained-tonal'}
                onPress={() => onOpenDecision({ kind: 'action', action })}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
                testID={`moderation-action-${action}`}>
                {copy.action[action]}
              </Button>
            ))}
          </View>
        </>
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
  actionButtons: { gap: 8, marginVertical: 8, maxWidth: 560, width: '100%' },
  actionButton: { alignSelf: 'stretch' },
  actionButtonContent: { minHeight: 48 },
  divider: { marginVertical: 8 },
  appealReason: { backgroundColor: '#80808014', borderRadius: 8, gap: 4, padding: 10 },
});
