import { useCallback, useEffect, useRef, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import {
  listSavedOfflineMaps,
  saveOfflineMapThumbnail,
  subscribeToOfflineMaps,
  type SavedOfflineMap,
} from '@U/offline-map-library';
import { OFFLINE_MAP_STORAGE_UNAVAILABLE_LABEL } from './const';
import OfflineMapList from './offline-map-list/offline-map-list';
import {
  formatBytes,
  OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO,
  parseOfflineMapPackBounds,
  takeOfflineMapThumbnail,
} from './utils';
import type { MapsPageCopy } from '../const';

export default function OfflineMapsTab({ copy }: { copy: MapsPageCopy }) {
  const router = useRouter();
  const { colors } = useTheme();
  const [maps, setMaps] = useState<SavedOfflineMap[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const thumbnailRequests = useRef(new Set<string>());

  const totalStorageBytes = maps.reduce((total, offlineMap) => total + (offlineMap.sizeBytes ?? 0), 0);
  const totalStorageLabel = maps.some((offlineMap) => offlineMap.sizeBytes === undefined)
    ? OFFLINE_MAP_STORAGE_UNAVAILABLE_LABEL
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
          const metadata: unknown = pack.metadata;
          const metadataRecord =
            typeof metadata === 'object' && metadata !== null ? (metadata as Record<string, unknown>) : undefined;
          const savedMap = savedMapById.get(id);
          const hasCurrentThumbnail =
            Boolean(savedMap?.thumbnailUri) && savedMap?.thumbnailAspectRatio === OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO;
          const title = savedMap?.title ?? (typeof metadataRecord?.title === 'string' ? metadataRecord.title : id);
          return {
            offlineMap: {
              id,
              title,
              ...(hasCurrentThumbnail ? { thumbnailUri: savedMap?.thumbnailUri } : {}),
              ...(hasCurrentThumbnail ? { thumbnailAspectRatio: savedMap?.thumbnailAspectRatio } : {}),
              ...(sizeBytes === undefined ? {} : { sizeBytes }),
            },
            bounds: parseOfflineMapPackBounds(pack.bounds),
            isSatellite: metadataRecord?.style === 'satellite',
          };
        }),
      );
      const loadedMaps = mapDetails.filter((mapDetailsForPack) => mapDetailsForPack !== null);
      const offlineMaps = loadedMaps.map(({ offlineMap }) => offlineMap);
      setMaps(offlineMaps);
      loadedMaps.forEach(({ offlineMap, bounds, isSatellite }) => {
        if (
          (offlineMap.thumbnailUri && offlineMap.thumbnailAspectRatio === OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO) ||
          !bounds ||
          thumbnailRequests.current.has(offlineMap.id)
        ) {
          return;
        }
        thumbnailRequests.current.add(offlineMap.id);
        void takeOfflineMapThumbnail(bounds, isSatellite)
          .then((thumbnail) =>
            thumbnail ? saveOfflineMapThumbnail(offlineMap.id, thumbnail.uri, thumbnail.aspectRatio) : undefined,
          )
          .catch(() => undefined)
          .finally(() => thumbnailRequests.current.delete(offlineMap.id));
      });
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
        <OfflineMapList
          maps={maps}
          copy={copy}
          onMapsChange={setMaps}
          onOpenMap={(offlineMap) =>
            router.push({ pathname: `/${ROUTES.offlineMap}/[id]` as never, params: { id: offlineMap.id } })
          }
        />
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
