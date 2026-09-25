import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, IconButton, ProgressBar, Text, useTheme } from 'react-native-paper';
import type { MigrationCopy } from './const';
import type { MigrationViewState } from './hooks';

export default function MigrationStatus({
  state,
  copy,
  onDismissError,
}: {
  state: MigrationViewState;
  copy: MigrationCopy;
  onDismissError: () => void;
}) {
  const { colors } = useTheme();
  const shouldRender = state.isProcessing || Boolean(state.jobId) || Boolean(state.error);
  const hasStatusError = Boolean(state.error) || state.isServerFailed;
  const statusText = getStatusText(state, copy);

  if (!shouldRender) return null;

  return (
    <View
      style={[
        styles.status,
        {
          backgroundColor: hasStatusError
            ? colors.errorContainer
            : state.isServerCompleted
              ? colors.tertiaryContainer
              : colors.surface,
        },
      ]}>
      <View style={styles.statusHeader}>
        {state.isProcessing && <ActivityIndicator size="small" color={colors.primary} />}
        {!state.isProcessing && state.isServerCompleted && (
          <MaterialCommunityIcons name="check-circle-outline" size={24} color={colors.tertiary} />
        )}
        {!state.isProcessing && hasStatusError && (
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.error} />
        )}
        <Text
          variant="bodyMedium"
          style={[
            styles.statusText,
            {
              color: hasStatusError
                ? colors.onErrorContainer
                : state.isServerCompleted
                  ? colors.onTertiaryContainer
                  : colors.onSurface,
            },
          ]}>
          {statusText}
        </Text>
      </View>

      {state.error && (
        <View style={[styles.errorNotice, { backgroundColor: colors.errorContainer }]} testID="migration-error">
          <MaterialCommunityIcons name="alert-circle-outline" size={22} color={colors.error} />
          <View style={styles.errorContent}>
            <Text variant="titleSmall" style={{ color: colors.onErrorContainer }}>
              {copy.errorTitle}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.onErrorContainer }}>
              {state.error}
            </Text>
          </View>
          <IconButton
            icon="close"
            iconColor={colors.onErrorContainer}
            onPress={onDismissError}
            accessibilityLabel={copy.closeError}
            testID="migration-error-close"
          />
        </View>
      )}

      {state.job?.status === 'queued' && <QueueStatus state={state} copy={copy} />}

      {state.job && <ServerProgress state={state} copy={copy} />}

      {state.isArchiveTransferActive && <UploadProgress state={state} copy={copy} />}
    </View>
  );
}

function QueueStatus({ state, copy }: { state: MigrationViewState; copy: MigrationCopy }) {
  const { colors } = useTheme();
  const { job } = state;
  if (
    !job ||
    typeof job.queuePosition !== 'number' ||
    typeof job.queueAhead !== 'number' ||
    typeof job.queueSize !== 'number'
  ) {
    return null;
  }

  const text =
    job.queueAhead > 0
      ? copy.queueAhead(job.queueAhead, job.queuePosition, job.queueSize)
      : copy.queueNext(job.queuePosition, job.queueSize);

  return (
    <View style={[styles.queueNotice, { backgroundColor: colors.primaryContainer }]}>
      <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
      <Text variant="bodySmall" style={{ color: colors.onPrimaryContainer, flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

function ServerProgress({ state, copy }: { state: MigrationViewState; copy: MigrationCopy }) {
  const { colors } = useTheme();
  const { job } = state;
  if (!job) return null;

  return (
    <View style={styles.progressDetails}>
      <View style={styles.progressHeader}>
        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          {copy.progress}
        </Text>
        <Text variant="titleMedium" style={{ color: colors.primary }}>
          {state.progressPercent}%
        </Text>
      </View>
      <ProgressBar progress={state.progress} color={colors.primary} style={styles.progressBar} />
      <View style={styles.progressStats}>
        <ProgressStat value={`${job.processedActivities}/${job.totalActivities || '—'}`} label={copy.processed} />
        <ProgressStat value={job.importedActivities} label={copy.imported} color={colors.tertiary} />
        <ProgressStat value={job.skippedActivities} label={copy.skipped} color={colors.error} />
      </View>
    </View>
  );
}

function UploadProgress({ state, copy }: { state: MigrationViewState; copy: MigrationCopy }) {
  const { colors } = useTheme();

  return (
    <View style={styles.progressDetails} testID="migration-upload-progress">
      <View style={styles.progressHeader}>
        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          {copy.uploadProgress}
        </Text>
        <Text variant="titleMedium" style={{ color: colors.primary }}>
          {state.uploadProgressPercent}%
        </Text>
      </View>
      <ProgressBar progress={state.uploadProgress} color={colors.primary} style={styles.progressBar} />
    </View>
  );
}

function ProgressStat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.progressStat, { backgroundColor: colors.surfaceVariant }]}>
      <Text variant="titleMedium" style={{ color: color ?? colors.onSurface }}>
        {value}
      </Text>
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

function getStatusText(state: MigrationViewState, copy: MigrationCopy) {
  if (state.isUnzipping) return copy.unzipping;
  if (state.isRemovingMedia) return copy.remove;
  if (state.isZipping) return copy.zipping;
  if (state.isSendingArchive) return state.isWaitingForServer ? copy.waitingForServer : copy.transfer;
  if (state.isDeletingCacheFolder) return copy.cleaning;
  if (state.error && !state.job) return copy.error;
  if (state.isServerCompleted) return copy.successSending;
  if (state.isServerFailed) return state.job?.errorMessage || copy.failed;
  if (state.job?.status === 'queued') return copy.queued;
  if (state.job?.status === 'processing') return copy.processing;
  return '';
}

const styles = StyleSheet.create({
  status: {
    alignItems: 'stretch',
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  statusText: {
    flex: 1,
  },
  errorNotice: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingLeft: 10,
  },
  errorContent: {
    flex: 1,
    gap: 2,
    paddingVertical: 10,
  },
  queueNotice: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 10,
  },
  progressDetails: {
    gap: 10,
    marginTop: 12,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStats: {
    flexDirection: 'row',
    gap: 8,
  },
  progressStat: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  progressBar: {
    height: 7,
  },
});
