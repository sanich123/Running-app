import { useState } from 'react';
import { Image, Linking, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Divider,
  List,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import {
  useApplyModerationActionMutation,
  useDecideModerationAppealMutation,
  useGetModerationAppealsQuery,
  useGetModerationReportDetailsQuery,
  useGetModerationReportsQuery,
  useGetModeratorAccessQuery,
} from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { MODERATION_ACTIONS, MODERATION_DASHBOARD_COPY, REPORT_STATUS_OPTIONS } from './const';
import type { ModerationTab, PendingDecision, ReportFilter } from './types';
import type { ModerationActionType } from '@R/services/moderation/types';

export default function ModerationDashboard() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ reportId?: string; appealId?: string; showAppeals?: string }>();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = MODERATION_DASHBOARD_COPY[language];
  const isWideLayout = width >= 900;
  const [activeTab, setActiveTab] = useState<ModerationTab>(params.showAppeals === 'true' ? 'appeals' : 'reports');
  const [statusFilter, setStatusFilter] = useState<ReportFilter>('all');
  const [selectedReportOverride, setSelectedReportOverride] = useState<string | null>(null);
  const selectedReportId = selectedReportOverride ?? (typeof params.reportId === 'string' ? params.reportId : '');
  const [selectedAppealOverride, setSelectedAppealOverride] = useState<string | null>(null);
  const selectedAppealId = selectedAppealOverride ?? (typeof params.appealId === 'string' ? params.appealId : '');
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [suspensionDays, setSuspensionDays] = useState('7');
  const { data: access, isLoading: isCheckingAccess } = useGetModeratorAccessQuery();
  const isModerator = access?.isModerator === true;
  const reportsQuery = useGetModerationReportsQuery({ take: 100 }, { skip: !isModerator });
  const appealsQuery = useGetModerationAppealsQuery({ take: 100 }, { skip: !isModerator });
  const reportDetailsQuery = useGetModerationReportDetailsQuery(selectedReportId, {
    skip: !isModerator || !selectedReportId,
  });
  const [applyModerationAction, actionState] = useApplyModerationActionMutation();
  const [decideModerationAppeal, appealState] = useDecideModerationAppealMutation();
  const isSavingDecision = actionState.isLoading || appealState.isLoading;

  const reports = (reportsQuery.data ?? []).filter(
    (report) => statusFilter === 'all' || report.status === statusFilter,
  );
  const appeals = appealsQuery.data ?? [];
  const reportDetails = reportDetailsQuery.data;
  const selectedAppeal = appeals.find(({ id }) => id === selectedAppealId);
  const report = reportDetails?.report;
  const context = reportDetails?.context;
  const canApplyActions = report?.status === 'open' || report?.status === 'in_review';
  const isVideoUpload = report?.targetType === 'media_upload' && context?.contentType?.startsWith('video/');
  const previewUrl =
    context?.thumbnail ??
    (report?.targetType === 'media' || (report?.targetType === 'media_upload' && !isVideoUpload) ? context?.url : null);
  const moderationActions =
    report?.targetType === 'media_upload'
      ? (['approve_media', 'reject_media'] as ModerationActionType[])
      : report?.targetType === 'user'
        ? MODERATION_ACTIONS.filter((action) =>
            ['warn_user', 'temporary_suspend', 'permanent_suspend', 'reject_report'].includes(action),
          )
        : MODERATION_ACTIONS.filter(
            (action) => action !== 'restore_content' || context?.moderationStatus !== 'visible',
          );

  const openDecisionDialog = (decision: PendingDecision) => {
    setDecisionNote('');
    setPendingDecision(decision);
  };

  const confirmDecision = async () => {
    if (!pendingDecision || !report) return;
    const note = decisionNote.trim();
    try {
      if (pendingDecision.kind === 'action') {
        await applyModerationAction({
          reportId: report.id,
          request: {
            action: pendingDecision.action,
            ...(note ? { note } : {}),
            ...(pendingDecision.action === 'temporary_suspend' ? { suspensionDays: Number(suspensionDays) || 7 } : {}),
          },
        }).unwrap();
        successToast(copy.actionComplete);
      } else {
        await decideModerationAppeal({
          appealId: pendingDecision.appealId,
          request: { decision: pendingDecision.decision, ...(note ? { note } : {}) },
        }).unwrap();
        successToast(copy.appealComplete);
      }
      setPendingDecision(null);
      setSelectedAppealOverride('');
      await Promise.all([reportsQuery.refetch(), appealsQuery.refetch(), reportDetailsQuery.refetch()]);
    } catch (error) {
      errorToast(pendingDecision.kind === 'appeal' ? copy.appealError : copy.actionError, error);
    }
  };

  const selectReport = (reportId: string) => {
    setSelectedReportOverride(reportId);
    setSelectedAppealOverride('');
  };

  const selectAppeal = (appealId: string, reportId: string) => {
    setSelectedAppealOverride(appealId);
    setSelectedReportOverride(reportId);
  };

  const showContext = () => {
    if (!report || !context) return null;
    const contextText = context.comment ?? [context.title, context.description].filter(Boolean).join('\n\n');
    const profileName = [context.name, context.surname].filter(Boolean).join(' ');
    const mediaStatusLabel = context.moderationStatus
      ? (copy.mediaStatus as Record<string, string>)[context.moderationStatus]
      : undefined;
    return (
      <View style={styles.context}>
        {contextText ? <Text selectable>{contextText}</Text> : null}
        {profileName ? <Text>{profileName}</Text> : null}
        {previewUrl ? <Image source={{ uri: previewUrl }} style={styles.preview} resizeMode="contain" /> : null}
        {context.scores ? (
          <Text selectable>
            {copy.modelScores}:{' '}
            {Object.entries(context.scores)
              .map(([name, value]) => `${name} ${(value * 100).toFixed(1)}%`)
              .join(' · ')}
          </Text>
        ) : null}
        {context.frameCount !== undefined && context.frameCount !== null ? (
          <Text>
            {copy.framesChecked}: {context.frameCount}
          </Text>
        ) : null}
        {report.targetType === 'media_upload' && context.moderationStatus ? (
          <Text>
            {copy.mediaCheckStatus}: {mediaStatusLabel ?? context.moderationStatus}
          </Text>
        ) : null}
        {(report.targetType === 'media' || report.targetType === 'media_upload') && context.url ? (
          <Button
            mode="text"
            onPress={() => void Linking.openURL(context.url!).catch((error) => errorToast(copy.openError, error))}
            testID="moderation-open-media">
            {copy.openMedia}
          </Button>
        ) : null}
      </View>
    );
  };

  const renderReportDetails = () => {
    if (!selectedReportId) {
      return <Text style={{ color: colors.onSurfaceVariant }}>{copy.selectReport}</Text>;
    }
    if (reportDetailsQuery.isLoading) return <ActivityIndicator size="small" />;
    if (reportDetailsQuery.isError) {
      return <ErrorComponent error={reportDetailsQuery.error} refetch={reportDetailsQuery.refetch} />;
    }
    if (!report) return null;
    const targetType = copy.targetType[report.targetType];
    const contentStatus = ['visible', 'hidden', 'removed'].includes(context?.moderationStatus ?? '')
      ? (context?.moderationStatus as 'visible' | 'hidden' | 'removed')
      : undefined;
    const actionItems = moderationActions.filter((action) => {
      if (action === 'approve_media' || action === 'reject_media')
        return context?.moderationStatus === 'review_required';
      if (action === 'restore_content') return contentStatus === 'hidden' || contentStatus === 'removed';
      if (action === 'hide_content') return contentStatus === 'visible';
      if (action === 'remove_content') return contentStatus !== 'removed';
      return true;
    });

    return (
      <View style={styles.detailContent}>
        {!isWideLayout ? (
          <Button mode="text" icon="arrow-left" onPress={() => setSelectedReportOverride('')}>
            {copy.back}
          </Button>
        ) : null}
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
        {showContext()}
        {contentStatus ? (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {copy.currentStatus}: {contentStatus === 'visible' ? copy.visible : copy[contentStatus]}
          </Text>
        ) : null}
        {selectedAppeal?.status === 'pending' ? (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => openDecisionDialog({ kind: 'appeal', appealId: selectedAppeal.id, decision: 'upheld' })}>
              {copy.upholdAppeal}
            </Button>
            <Button
              mode="outlined"
              onPress={() => openDecisionDialog({ kind: 'appeal', appealId: selectedAppeal.id, decision: 'rejected' })}>
              {copy.rejectAppeal}
            </Button>
          </View>
        ) : null}
        {activeTab === 'reports' && canApplyActions ? (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleSmall">{copy.actions}</Text>
            <View style={styles.actionButtons}>
              {actionItems.map((action) => (
                <Button
                  key={action}
                  mode={action === 'remove_content' || action === 'permanent_suspend' ? 'outlined' : 'contained-tonal'}
                  onPress={() => openDecisionDialog({ kind: 'action', action })}
                  testID={`moderation-action-${action}`}>
                  {copy.action[action]}
                </Button>
              ))}
            </View>
          </>
        ) : null}
        <Divider style={styles.divider} />
        <Text variant="titleSmall">{copy.history}</Text>
        {reportDetails.actions.length ? (
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
  };

  if (isCheckingAccess) {
    return <ActivityIndicator size="large" style={styles.loading} testID="moderation-access-loading" />;
  }

  if (!isModerator) {
    return <Text style={[styles.noAccess, { color: colors.onSurfaceVariant }]}>{copy.noAccess}</Text>;
  }

  const isQueueLoading = activeTab === 'reports' ? reportsQuery.isLoading : appealsQuery.isLoading;
  const queueError = activeTab === 'reports' ? reportsQuery.isError : appealsQuery.isError;
  const queueErrorValue = activeTab === 'reports' ? reportsQuery.error : appealsQuery.error;
  const reportFilterButtons = [
    { value: 'all', label: copy.filters.all },
    ...REPORT_STATUS_OPTIONS.map((status) => ({ value: status, label: copy.filters[status] })),
  ];
  const pendingActionLabel =
    pendingDecision?.kind === 'action' ? copy.action[pendingDecision.action] : copy.appealDecision;

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background, marginHorizontal: Platform.OS === 'web' ? 'auto' : 0 },
        ]}>
        <Text variant="headlineSmall" style={styles.title}>
          {copy.title}
        </Text>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as ModerationTab);
            setSelectedAppealOverride('');
          }}
          buttons={[
            { value: 'reports', label: copy.reports, icon: 'flag-outline' },
            { value: 'appeals', label: copy.appeals, icon: 'message-alert-outline' },
          ]}
        />
        <View style={[styles.columns, isWideLayout && styles.columnsWide]}>
          <View
            style={[
              styles.queue,
              isWideLayout && styles.queueWide,
              !isWideLayout && Boolean(selectedReportId) && styles.hidden,
            ]}>
            {activeTab === 'reports' ? (
              <SegmentedButtons
                style={styles.filterButtons}
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ReportFilter)}
                buttons={reportFilterButtons}
              />
            ) : null}
            {isQueueLoading ? <ActivityIndicator size="small" style={styles.loading} /> : null}
            {queueError ? (
              <ErrorComponent
                error={queueErrorValue ?? new Error(copy.loadError)}
                refetch={activeTab === 'reports' ? reportsQuery.refetch : appealsQuery.refetch}
              />
            ) : activeTab === 'reports' ? (
              reports.length ? (
                reports.map((item) => (
                  <List.Item
                    key={item.id}
                    title={`${copy.targetType[item.targetType]} · ${copy.reasons[item.reason]}`}
                    description={`${copy.status[item.status]} · ${new Date(item.createdAt).toLocaleString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US')}`}
                    left={(props) => <List.Icon {...props} icon="flag-outline" />}
                    onPress={() => selectReport(item.id)}
                    style={[
                      styles.queueItem,
                      { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                      selectedReportId === item.id && { borderColor: colors.primary },
                    ]}
                    testID={`moderation-report-${item.id}`}
                  />
                ))
              ) : (
                <Text style={{ color: colors.onSurfaceVariant }}>{copy.emptyReports}</Text>
              )
            ) : appeals.length ? (
              appeals.map((item) => (
                <List.Item
                  key={item.id}
                  title={`${copy.reportId}: ${item.reportId}`}
                  description={`${item.reason}\n${new Date(item.createdAt).toLocaleString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US')}`}
                  left={(props) => <List.Icon {...props} icon="message-alert-outline" />}
                  onPress={() => selectAppeal(item.id, item.reportId)}
                  style={[
                    styles.queueItem,
                    { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                    selectedAppealId === item.id && { borderColor: colors.primary },
                  ]}
                  testID={`moderation-appeal-${item.id}`}
                />
              ))
            ) : (
              <Text style={{ color: colors.onSurfaceVariant }}>{copy.emptyAppeals}</Text>
            )}
          </View>
          <View
            style={[
              styles.detail,
              isWideLayout && styles.detailWide,
              !isWideLayout && !selectedReportId && styles.hidden,
              { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
            ]}>
            {renderReportDetails()}
          </View>
        </View>
      </ScrollView>
      <Portal>
        <Dialog visible={Boolean(pendingDecision)} onDismiss={() => setPendingDecision(null)}>
          <Dialog.Title>{pendingActionLabel}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{copy.confirm}</Text>
            {pendingDecision?.kind === 'action' && pendingDecision.action === 'temporary_suspend' ? (
              <TextInput
                label={language === LANGUAGES.russian ? 'Срок блокировки, дней' : 'Suspension days'}
                value={suspensionDays}
                onChangeText={setSuspensionDays}
                keyboardType="number-pad"
                style={styles.dialogInput}
                testID="moderation-suspension-days"
              />
            ) : null}
            <TextInput
              label={copy.note}
              placeholder={copy.noteHint}
              value={decisionNote}
              onChangeText={setDecisionNote}
              multiline
              maxLength={1000}
              style={styles.dialogInput}
              testID="moderation-decision-note"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingDecision(null)} disabled={isSavingDecision}>
              {copy.cancel}
            </Button>
            <Button onPress={() => void confirmDecision()} loading={isSavingDecision} disabled={isSavingDecision}>
              {copy.confirmAction}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: 12, maxWidth: 1140, padding: 16, width: '100%' },
  title: { marginBottom: 4 },
  columns: { flex: 1, gap: 12 },
  columnsWide: { alignItems: 'flex-start', flexDirection: 'row' },
  queue: { gap: 8, width: '100%' },
  queueWide: { flex: 0.8, maxWidth: 430 },
  detail: { borderRadius: 10, borderWidth: 1, flex: 1, padding: 16, width: '100%' },
  detailWide: { minHeight: 400 },
  detailContent: { gap: 8 },
  queueItem: { borderRadius: 8, borderWidth: 1 },
  filterButtons: { marginBottom: 4 },
  actionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  divider: { marginVertical: 8 },
  context: { gap: 8 },
  preview: { height: 260, maxWidth: '100%', width: 360 },
  appealReason: { backgroundColor: '#80808014', borderRadius: 8, gap: 4, padding: 10 },
  dialogInput: { marginTop: 12 },
  loading: { margin: 24 },
  noAccess: { alignSelf: 'center', padding: 24 },
  hidden: { display: 'none' },
});
