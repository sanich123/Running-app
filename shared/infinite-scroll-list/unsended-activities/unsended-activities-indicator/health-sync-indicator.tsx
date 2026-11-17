import { View, StyleSheet } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';
import { clearHealthSyncStatus } from '@R/slices/health-sync/health-sync';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { cancelHealthSyncOperation } from '@U/watch-import/health-sync-cancellation';
import { HEALTH_SYNC_TEXT } from '../const';

export default function HealthSyncIndicator() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const status = useAppSelector(({ healthSync }) => healthSync.status);
  if (!status) return null;

  const syncStatus = status;
  const copy = HEALTH_SYNC_TEXT[language];
  const provider = syncStatus.source === 'healthkit' ? copy.healthKit : copy.healthConnect;
  const progress =
    syncStatus.phase === 'reading'
      ? copy.reading(syncStatus.foundCount)
      : copy.sending(syncStatus.foundCount ?? 0, syncStatus.processedCount);

  function cancelSync() {
    cancelHealthSyncOperation(syncStatus.id);
    dispatch(clearHealthSyncStatus(syncStatus.id));
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.secondaryContainer, borderColor: colors.outlineVariant }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
        <Icon source="heart-pulse" size={22} color={colors.onSecondary} />
      </View>
      <View style={styles.copy}>
        <Text variant="titleSmall" style={{ color: colors.onSecondaryContainer }}>
          {copy.title(provider)}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {progress}
        </Text>
      </View>
      <Button
        compact
        mode="text"
        icon="close"
        testID="cancel-health-sync"
        accessibilityLabel={copy.cancel}
        onPress={cancelSync}
        textColor={colors.error}>
        {copy.cancel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    margin: 12,
    padding: 12,
  },
  iconContainer: { alignItems: 'center', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  copy: { flex: 1, gap: 2, minWidth: 0 },
});
