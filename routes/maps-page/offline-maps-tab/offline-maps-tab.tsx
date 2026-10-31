import { useCallback, useEffect, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import { listSavedOfflineMaps, subscribeToOfflineMaps, type SavedOfflineMap } from '@U/offline-map-library';
import OfflineMapList from './offline-map-list/offline-map-list';
import { formatBytes } from './utils';
import type { MapsPageCopy } from '../const';

export default function OfflineMapsTab({ copy }: { copy: MapsPageCopy }) {
  const { colors } = useTheme();
  const [maps, setMaps] = useState<SavedOfflineMap[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const totalStorageBytes = maps.reduce((total, offlineMap) => total + (offlineMap.sizeBytes ?? 0), 0);
  const totalStorageLabel = maps.some((offlineMap) => offlineMap.sizeBytes === undefined)
    ? '—'
    : formatBytes(totalStorageBytes);

  const refreshMaps = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [savedMaps, packs] = await Promise.all([listSavedOfflineMaps(), Mapbox.offlineManager.getPacks()]);
      const savedMapById = new Map(savedMaps.map((offlineMap) => [offlineMap.id, offlineMap]));
      const mapDetails = await Promise.all(
        packs.map(async (pack) => {
          const id = pack.name ?? '';
          if (!id) return null;
          let sizeBytes: number | undefined;
          try {
            sizeBytes = (await pack.status()).completedResourceSize;
          } catch {
            sizeBytes = undefined;
          }
          return {
            id,
            title: savedMapById.get(id)?.title ?? id,
            ...(sizeBytes === undefined ? {} : { sizeBytes }),
          };
        }),
      );
      setMaps(mapDetails.filter((offlineMap): offlineMap is SavedOfflineMap => offlineMap !== null));
      setHasError(false);
    } catch (error) {
      setHasError(true);
      errorToast(copy.libraryLoadFailed, error);
    } finally {
      setHasLoaded(true);
      setIsRefreshing(false);
    }
  }, [copy.libraryLoadFailed]);

  useEffect(() => {
    void Promise.resolve().then(refreshMaps);
    return subscribeToOfflineMaps?.(() => void refreshMaps());
  }, [refreshMaps]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
        {totalStorageLabel}
      </Text>
      {!hasLoaded ? (
        <ActivityIndicator />
      ) : hasError ? (
        <Button mode="outlined" loading={isRefreshing} onPress={() => void refreshMaps()}>
          {copy.retry}
        </Button>
      ) : maps.length ? (
        <OfflineMapList maps={maps} copy={copy} onMapsChange={setMaps} />
      ) : (
        <EmptyState
          icon="map-outline"
          title={copy.noOfflineMaps}
          message={copy.noOfflineMapsMessage}
          style={styles.emptyState}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 24 },
  emptyState: { margin: 0 },
});
