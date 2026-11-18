import { View, StyleSheet } from 'react-native';
import { Icon, IconButton, ProgressBar, Text, useTheme } from 'react-native-paper';
import { clearHealthSyncStatus } from '@R/slices/health-sync/health-sync';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { cancelHealthSyncOperation } from '@U/watch-import/health-sync-cancellation';
import { HEALTH_SYNC_TEXT } from '../const';

export default function HealthSyncIndicator() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { status } = useAppSelector(({ healthSync }) => healthSync);
  if (!status) return null;
  const syncStatus = status;
  const copy = HEALTH_SYNC_TEXT[language];
  const provider = syncStatus.source === 'healthkit' ? copy.healthKit : copy.healthConnect;
  const isDeterminate = syncStatus.phase === 'sending' && syncStatus.foundCount !== null && syncStatus.foundCount > 0;
  const progress =
    syncStatus.phase === 'reading'
      ? copy.reading(syncStatus.foundCount)
      : copy.sending(syncStatus.foundCount ?? 0, syncStatus.processedCount);
  const progressValue = isDeterminate ? Math.min(1, syncStatus.processedCount / (syncStatus.foundCount ?? 1)) : 0;

  function cancelSync() {
    cancelHealthSyncOperation(syncStatus.id);
    dispatch(clearHealthSyncStatus(syncStatus.id));
  }

  return (
    <View
      testID="health-sync-indicator"
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
          <Icon source="heart-pulse" size={20} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text variant="titleSmall" style={{ color: colors.onSurface }} numberOfLines={1}>
            {copy.title(provider)}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
            {progress}
          </Text>
        </View>
        <IconButton
          icon="close"
          size={18}
          mode="contained-tonal"
          containerColor={colors.secondaryContainer}
          iconColor={colors.onSurfaceVariant}
          testID="cancel-health-sync"
          accessibilityLabel={copy.cancel}
          onPress={cancelSync}
          style={styles.cancelButton}
        />
      </View>
      <ProgressBar
        progress={progressValue}
        indeterminate={!isDeterminate}
        color={colors.primary}
        testID="health-sync-progress"
        style={styles.progressBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
    marginHorizontal: 12,
    marginTop: 8,
    padding: 12,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  iconContainer: { alignItems: 'center', borderRadius: 12, height: 36, justifyContent: 'center', width: 36 },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  cancelButton: { margin: 0 },
  progressBar: { height: 3, marginLeft: 46 },
});
