import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, IconButton, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useGetAdminAccessQuery } from '@R/services/admin/admin';
import {
  useApplyModerationActionMutation,
  useDecideModerationAppealMutation,
  useGetModerationAppealsQuery,
  useGetModerationReportDetailsQuery,
  useGetModerationReportsQuery,
} from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { MODERATION_DASHBOARD_COPY } from '../const';
import DecisionDialog from './decision-dialog/decision-dialog';
import ReportDetails from './report-details/report-details';
import ReportQueue from './report-queue/report-queue';
import type { ModerationTab, PendingDecision, ReportFilter } from '../types';

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
  const { data: access, isLoading: isCheckingAccess } = useGetAdminAccessQuery();
  const isModerator = access?.permissions.includes('moderation.manage') === true;
  const reportsQuery = useGetModerationReportsQuery({ take: 100 }, { skip: !isModerator });
  const appealsQuery = useGetModerationAppealsQuery({ take: 100 }, { skip: !isModerator });
  const reportDetailsQuery = useGetModerationReportDetailsQuery(selectedReportId, {
    skip: !isModerator || !selectedReportId,
  });
  const [applyModerationAction, actionState] = useApplyModerationActionMutation();
  const [decideModerationAppeal, appealState] = useDecideModerationAppealMutation();
  const isSavingDecision = actionState.isLoading || appealState.isLoading;
  const reports = (reportsQuery.data ?? []).filter(
    (report) => report.status !== 'appealed' && (statusFilter === 'all' || report.status === statusFilter),
  );
  const appeals = appealsQuery.data ?? [];
  const selectedAppeal = appeals.find(({ id }) => id === selectedAppealId);
  const report = reportDetailsQuery.data?.report;
  const isClosedSelectedReport = report?.status === 'resolved' || report?.status === 'rejected';
  const isQueueLoading = activeTab === 'reports' ? reportsQuery.isLoading : appealsQuery.isLoading;
  const queueError = activeTab === 'reports' ? reportsQuery.isError : appealsQuery.isError;
  const queueErrorValue = activeTab === 'reports' ? reportsQuery.error : appealsQuery.error;
  const hasQueueItems = activeTab === 'reports' ? reports.length > 0 : appeals.length > 0;
  const showQueue = !((!isWideLayout && Boolean(selectedReportId)) || (isWideLayout && isClosedSelectedReport));

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

  if (isCheckingAccess) {
    return <ActivityIndicator size="large" style={styles.loading} testID="moderation-access-loading" />;
  }

  if (!isModerator) {
    return <Text style={[styles.noAccess, { color: colors.onSurfaceVariant }]}>{copy.noAccess}</Text>;
  }

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
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
            { value: 'appeals', label: copy.appeals, icon: 'message-text-outline' },
          ]}
        />
        <View style={[styles.columns, isWideLayout && styles.columnsWide]}>
          <ReportQueue
            activeTab={activeTab}
            isWideLayout={isWideLayout}
            showQueue={showQueue}
            hasQueueItems={hasQueueItems}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            reports={reports}
            appeals={appeals}
            selectedReportId={selectedReportId}
            selectedAppealId={selectedAppealId}
            isLoading={isQueueLoading}
            isError={queueError}
            error={queueErrorValue}
            refetch={activeTab === 'reports' ? reportsQuery.refetch : appealsQuery.refetch}
            language={language}
            copy={copy}
            onSelectReport={selectReport}
            onSelectAppeal={selectAppeal}
          />
          <View
            style={[
              styles.detailColumn,
              isWideLayout && isClosedSelectedReport && styles.detailClosedWide,
              !isWideLayout && !selectedReportId && styles.hidden,
              isWideLayout && !selectedReportId && !hasQueueItems && styles.hidden,
            ]}>
            {!isWideLayout || isClosedSelectedReport ? (
              <View style={styles.detailToolbar}>
                <IconButton
                  icon="arrow-left"
                  accessibilityLabel={copy.back}
                  onPress={() => setSelectedReportOverride('')}
                  testID="moderation-back-to-queue"
                />
              </View>
            ) : null}
            <View
              style={[
                styles.detail,
                isWideLayout && styles.detailWide,
                { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
              ]}>
              <ReportDetails
                selectedReportId={selectedReportId}
                isLoading={reportDetailsQuery.isLoading}
                isError={reportDetailsQuery.isError}
                error={reportDetailsQuery.error}
                refetch={reportDetailsQuery.refetch}
                reportDetails={reportDetailsQuery.data}
                selectedAppeal={selectedAppeal}
                activeTab={activeTab}
                copy={copy}
                language={language}
                onOpenDecision={openDecisionDialog}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <DecisionDialog
        pendingDecision={pendingDecision}
        isSaving={isSavingDecision}
        decisionNote={decisionNote}
        onDecisionNoteChange={setDecisionNote}
        suspensionDays={suspensionDays}
        onSuspensionDaysChange={setSuspensionDays}
        language={language}
        copy={copy}
        onDismiss={() => setPendingDecision(null)}
        onConfirm={() => void confirmDecision()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', flexGrow: 1, gap: 16, maxWidth: 1280, padding: 16, width: '100%' },
  title: { marginBottom: 4 },
  columns: { flex: 1, gap: 16, minWidth: 0 },
  columnsWide: { alignItems: 'stretch', flexDirection: 'row' },
  detailColumn: { flex: 1, minWidth: 0, width: '100%' },
  detailToolbar: { alignItems: 'flex-start', marginBottom: 4 },
  detail: { borderRadius: 12, borderWidth: 1, flex: 1, minWidth: 0, padding: 20, width: '100%' },
  detailWide: { minHeight: 400 },
  detailClosedWide: { alignSelf: 'center', maxWidth: 1120 },
  loading: { margin: 24 },
  noAccess: { alignSelf: 'center', padding: 24 },
  hidden: { display: 'none' },
});
