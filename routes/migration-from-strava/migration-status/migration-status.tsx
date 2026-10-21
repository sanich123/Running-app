import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { Pressable, View, StyleSheet } from 'react-native';
import { ActivityIndicator, IconButton, ProgressBar, Text, useTheme } from 'react-native-paper';
import { getStatusText, formatBytes } from './utils';
import type { MigrationCopy } from '../const';
import type { MigrationViewState } from '../hooks';

export default function MigrationStatus({
  state,
  copy,
  isProcessing,
  isCancelAvailable,
  isForegroundUploadSession,
  onChooseArchive,
  onCancel,
  onDismissError,
}: {
  state: MigrationViewState;
  copy: MigrationCopy;
  isProcessing: boolean;
  isCancelAvailable: boolean;
  isForegroundUploadSession: boolean;
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
  const job = state.job;
  const useLocalProgress = isForegroundUploadSession && state.isSendingArchive;
  const uploadTotal = job?.uploadBytesTotal ?? 0;
  const uploadProgress = useLocalProgress
    ? state.uploadProgress
    : job && uploadTotal > 0
      ? Math.min(1, (job.uploadBytesReceived ?? 0) / uploadTotal)
      : state.uploadProgress;
  const serverReceived = job?.uploadBytesReceived ?? 0;
  const uploadReceived =
    useLocalProgress && uploadTotal > 0 ? Math.round(uploadProgress * uploadTotal) : serverReceived;

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

      {job?.status === 'queued' &&
        typeof job.queuePosition === 'number' &&
        typeof job.queueAhead === 'number' &&
        typeof job.queueSize === 'number' && (
          <View style={[styles.queueNotice, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
            <Text variant="bodySmall" style={{ color: colors.onPrimaryContainer, flex: 1 }}>
              {job.queueAhead > 0
                ? copy.queueAhead(job.queueAhead, job.queuePosition, job.queueSize)
                : copy.queueNext(job.queuePosition, job.queueSize)}
            </Text>
          </View>
        )}

      {job && job.status !== 'uploading' && (
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
            {[
              { value: `${job.processedActivities}/${job.totalActivities || '—'}`, label: copy.processed },
              { value: job.importedActivities, label: copy.imported, color: colors.tertiary },
              { value: job.skippedActivities, label: copy.skipped, color: colors.error },
            ].map(({ value, label, color }) => (
              <View key={label} style={[styles.progressStat, { backgroundColor: colors.surfaceVariant }]}>
                <Text variant="titleMedium" style={{ color: color ?? colors.onSurface }}>
                  {value}
                </Text>
                <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

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

      {state.isArchiveTransferActive && (
        <View style={styles.progressDetails} testID="migration-upload-progress">
          <View style={styles.progressHeader}>
            <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
              {copy.uploadProgress}
            </Text>
            <Text variant="titleMedium" style={{ color: colors.primary }}>
              {Math.round(uploadProgress * 100)}%
            </Text>
          </View>
          <ProgressBar progress={uploadProgress} color={colors.primary} style={styles.progressBar} />
          {uploadTotal > 0 && (
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {formatBytes(uploadReceived)} / {formatBytes(uploadTotal)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
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
