import { useCallback, useEffect, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { listSavedOfflineMaps, type SavedOfflineMap } from '@U/offline-map-library';
import MapRegionDownloader from './map-region-downloader/map-region-downloader';
import OfflineMapList from './offline-map-list/offline-map-list';
import type { MapsPageCopy } from '../const';

export default function OfflineMapsTab({ copy }: { copy: MapsPageCopy }) {
  const { colors } = useTheme();
  const { lastPosition, initialLocation } = useAppSelector(({ location }) => location);
  const [maps, setMaps] = useState<SavedOfflineMap[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const center = lastPosition ?? initialLocation;
  const centerCoordinate: [number, number] = center
    ? [center.coords.longitude, center.coords.latitude]
    : [37.6173, 55.7558];

  const refreshMaps = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [savedMaps, packs] = await Promise.all([listSavedOfflineMaps(), Mapbox.offlineManager.getPacks()]);
      const savedMapById = new Map(savedMaps.map((map) => [map.id, map]));
      setMaps(
        packs
          .map((pack) => ({ id: pack.name ?? '', title: savedMapById.get(pack.name ?? '')?.title ?? pack.name ?? '' }))
          .filter(({ id }) => id.length > 0),
      );
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
  }, [refreshMaps]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <MapRegionDownloader centerCoordinate={centerCoordinate} copy={copy} onDownloaded={refreshMaps} />
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
        {copy.maps}
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
        <Text style={{ color: colors.onSurfaceVariant }}>{copy.noOfflineMaps}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 32 },
  sectionTitle: { marginTop: 12 },
});
