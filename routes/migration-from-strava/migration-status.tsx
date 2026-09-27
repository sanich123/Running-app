import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { Pressable, View, StyleSheet } from 'react-native';
import { ActivityIndicator, IconButton, ProgressBar, Text, useTheme } from 'react-native-paper';
import type { MigrationCopy } from './const';
import type { MigrationViewState } from './hooks';

export default function MigrationStatus({
  state,
  copy,
  isProcessing,
  isCancelAvailable,
  onChooseArchive,
  onCancel,
  onDismissError,
}: {
  state: MigrationViewState;
  copy: MigrationCopy;
  isProcessing: boolean;
  isCancelAvailable: boolean;
  onChooseArchive: () => void;
  onCancel: () => void;
  onDismissError: () => void;
}) {
  const { colors } = useTheme();
  if (state.isInitial) {
    return (
      <View
        style={[styles.uploadAction, { backgroundColor: colors.primaryContainer, borderColor: colors.outlineVariant }]}
        testID="migration-upload-action">
        <Pressable
          onPress={onChooseArchive}
          testID="migration-choose"
          accessibilityRole="button"
          accessibilityLabel={copy.chooseArchive}
          style={({ pressed }) => [
            styles.uploadButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
          ]}>
          <MaterialCommunityIcons name="file-upload-outline" size={42} color={colors.onPrimary} />
        </Pressable>
      </View>
    );
  }

  const hasStatusError = Boolean(state.error) || state.isServerFailed;
  const canCancel = isCancelAvailable || state.job?.status === 'uploading';
  const statusText = getStatusText(state, copy);

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
      {isProcessing && canCancel && (
        <IconButton
          icon="close"
          iconColor={hasStatusError ? colors.onErrorContainer : colors.onSurfaceVariant}
          onPress={onCancel}
          accessibilityLabel={copy.cancel}
          testID="migration-cancel"
          style={styles.cancelButton}
        />
      )}
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

      {state.isServerCompleted && (
        <>
          <Text variant="bodySmall" style={[styles.duplicateHint, { color: colors.onTertiaryContainer }]}>
            {copy.duplicatesSkipped}
          </Text>
          <Pressable
            testID="migration-choose"
            accessibilityRole="button"
            accessibilityLabel={copy.chooseArchive}
            onPress={onChooseArchive}
            style={({ pressed }) => [
              styles.chooseAgainButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
            ]}>
            <MaterialCommunityIcons name="file-upload-outline" size={20} color={colors.onPrimary} />
            <Text variant="labelLarge" style={{ color: colors.onPrimary }}>
              {copy.chooseArchive}
            </Text>
          </Pressable>
        </>
      )}

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
  if (!job || job.status === 'uploading') return null;

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
  const serverProgress =
    state.job && state.job.uploadBytesTotal > 0
      ? Math.min(1, state.job.uploadBytesReceived / state.job.uploadBytesTotal)
      : state.uploadProgress;
  const received = state.job?.uploadBytesReceived ?? 0;
  const total = state.job?.uploadBytesTotal ?? 0;

  return (
    <View style={styles.progressDetails} testID="migration-upload-progress">
      <View style={styles.progressHeader}>
        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          {copy.uploadProgress}
        </Text>
        <Text variant="titleMedium" style={{ color: colors.primary }}>
          {Math.round(serverProgress * 100)}%
        </Text>
      </View>
      <ProgressBar progress={serverProgress} color={colors.primary} style={styles.progressBar} />
      {total > 0 && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {formatBytes(received)} / {formatBytes(total)}
        </Text>
      )}
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
  if (state.isServerCancelled) return copy.cancelled;
  if (state.job?.status === 'uploading') {
    const archiveFullyReceived =
      state.job.uploadBytesTotal > 0 && state.job.uploadBytesReceived >= state.job.uploadBytesTotal;
    return archiveFullyReceived ? copy.waitingForServer : copy.uploading;
  }
  if (state.job?.status === 'queued') return copy.queued;
  if (state.job?.status === 'processing') return copy.processing;
  return '';
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

const styles = StyleSheet.create({
  status: {
    alignItems: 'stretch',
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
  },
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingRight: 38,
  },
  duplicateHint: { marginTop: 12 },
  chooseAgainButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  uploadAction: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 128,
    justifyContent: 'center',
    padding: 16,
  },
  uploadButton: {
    alignItems: 'center',
    borderRadius: 38,
    elevation: 3,
    height: 76,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: 76,
  },
  cancelButton: {
    margin: 0,
    position: 'absolute',
    right: 4,
    top: 2,
  },
});
