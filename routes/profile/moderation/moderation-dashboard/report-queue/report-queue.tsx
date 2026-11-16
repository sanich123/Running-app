import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import ErrorComponent from '@S/error-component/error-component';
import ReportDetails from '../report-details/report-details';
import type { ModerationReportQueueProps } from '../types';

export default function ReportQueue({
  activeTab,
  isWideLayout,
  showQueue,
  hasQueueItems,
  statusFilter,
  onStatusFilterChange,
  reports,
  appeals,
  selectedReportId,
  selectedAppealId,
  isLoading,
  isError,
  error,
  refetch,
  language,
  copy,
  onSelectReport,
  onSelectAppeal,
  reportDetailsProps,
}: ModerationReportQueueProps) {
  const { colors } = useTheme();
  const linkedReport = reportDetailsProps?.reportDetails?.report;
  const displayedReports =
    linkedReport?.id === selectedReportId && !reports.some(({ id }) => id === selectedReportId)
      ? [...reports, linkedReport]
      : reports;
  const reportFilterButtons = [
    { value: 'new', label: copy.filters.new },
    { value: 'processed', label: copy.filters.processed },
  ];

  return (
    <View
      style={[
        styles.queue,
        isWideLayout && activeTab === 'reports' && styles.queueReportsWide,
        isWideLayout && activeTab === 'appeals' && (showQueue ? styles.queueWide : styles.hidden),
        isWideLayout && activeTab === 'appeals' && !hasQueueItems && !selectedReportId && styles.queueEmptyWide,
        !isWideLayout && activeTab === 'appeals' && !showQueue && styles.hidden,
      ]}>
      {activeTab === 'reports' ? (
        isWideLayout ? (
          <SegmentedButtons
            style={styles.filterButtons}
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value as typeof statusFilter)}
            buttons={reportFilterButtons}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            {reportFilterButtons.map(({ value, label }) => (
              <Pressable
                key={value}
                testID={`moderation-report-filter-${value}`}
                accessibilityRole="button"
                accessibilityState={{ selected: statusFilter === value }}
                onPress={() => onStatusFilterChange(value as typeof statusFilter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: statusFilter === value ? colors.secondaryContainer : colors.surface,
                    borderColor: statusFilter === value ? colors.primary : colors.outlineVariant,
                  },
                ]}>
                <Text
                  variant="labelMedium"
                  style={{
                    color: statusFilter === value ? colors.onSecondaryContainer : colors.onSurfaceVariant,
                  }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )
      ) : null}
      {isLoading ? <ActivityIndicator size="small" style={styles.loading} /> : null}
      {isError ? (
        <ErrorComponent error={error ?? new Error(copy.loadError)} refetch={refetch} />
      ) : activeTab === 'reports' ? (
        displayedReports.length ? (
          displayedReports.map((item) => (
            <List.Accordion
              key={item.id}
              expanded={selectedReportId === item.id}
              onPress={() => onSelectReport(item.id)}
              title={`${copy.targetType[item.targetType]} · ${copy.reasons[item.reason]}`}
              description={
                <View style={styles.reportDescription}>
                  {item.contextPreview ? (
                    <Text variant="bodySmall" numberOfLines={2} style={{ color: colors.onSurface }}>
                      {item.contextPreview}
                    </Text>
                  ) : null}
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {new Date(item.createdAt).toLocaleString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US')}
                  </Text>
                </View>
              }
              titleNumberOfLines={2}
              descriptionNumberOfLines={4}
              style={[
                styles.queueItem,
                { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                selectedReportId === item.id && { borderColor: colors.primary },
              ]}
              testID={`moderation-report-${item.id}`}
              accessibilityLabel={`${copy.targetType[item.targetType]} · ${copy.reasons[item.reason]}`}
              rippleColor={colors.primaryContainer}>
              {selectedReportId === item.id && reportDetailsProps ? (
                <View style={styles.accordionDetails}>
                  <ReportDetails
                    {...reportDetailsProps}
                    selectedReportId={item.id}
                    activeTab="reports"
                    copy={copy}
                    language={language}
                  />
                </View>
              ) : null}
            </List.Accordion>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surfaceVariant }]}>
            <Text variant="titleSmall" style={{ color: colors.onSurfaceVariant }}>
              {statusFilter === 'processed' ? copy.emptyProcessedReports : copy.emptyReports}
            </Text>
          </View>
        )
      ) : appeals.length ? (
        appeals.map((item) => (
          <List.Item
            key={item.id}
            title={`${copy.reportId}: ${item.reportId}`}
            description={`${item.reason}\n${new Date(item.createdAt).toLocaleString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US')}`}
            left={(props) => <List.Icon {...props} icon="message-text-outline" />}
            onPress={() => onSelectAppeal(item.id, item.reportId)}
            style={[
              styles.queueItem,
              { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
              selectedAppealId === item.id && { borderColor: colors.primary },
            ]}
            testID={`moderation-appeal-${item.id}`}
          />
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surfaceVariant }]}>
          <Text variant="titleSmall" style={{ color: colors.onSurfaceVariant }}>
            {copy.emptyAppeals}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  queue: { gap: 8, minWidth: 0, width: '100%' },
  queueWide: { flex: 0.42, maxWidth: 480, minWidth: 300 },
  queueReportsWide: { alignSelf: 'center', flex: 1, maxWidth: 960, width: '100%' },
  queueEmptyWide: { flex: 1, maxWidth: '100%' },
  filterButtons: { marginBottom: 4 },
  filterChips: { gap: 8, paddingBottom: 4 },
  filterChip: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  queueItem: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  reportDescription: { gap: 4 },
  accordionDetails: { paddingBottom: 16, paddingHorizontal: 16, paddingTop: 8 },
  emptyState: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', minHeight: 144, padding: 24 },
  loading: { margin: 24 },
  hidden: { display: 'none' },
});
