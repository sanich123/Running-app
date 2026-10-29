import { useRef, useState } from 'react';
import Mapbox, { Camera, MapView } from '@rnmapbox/maps';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput, useTheme } from 'react-native-paper';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import { errorToast } from '@S/error-toast/error-toast';
import { saveOfflineMap, removeOfflineMap } from '@U/offline-map-library';
import type { MapsPageCopy, OfflineBounds } from '../../const';

export default function MapRegionDownloader({
  centerCoordinate,
  copy,
  onDownloaded,
}: {
  centerCoordinate: [number, number];
  copy: MapsPageCopy;
  onDownloaded: () => Promise<void>;
}) {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  const pendingDownloadRef = useRef<{ id: string; created: Promise<void>; cancel: () => void } | null>(null);
  const [regionName, setRegionName] = useState('');
  const [visibleBounds, setVisibleBounds] = useState<OfflineBounds | null>(null);
  const [downloadingMapId, setDownloadingMapId] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);

  async function downloadVisibleRegion() {
    if (!visibleBounds || downloadingMapId) return;
    const id = `runich-region-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const title = regionName.trim() || copy.regionDefault;
    setDownloadingMapId(id);
    setDownloadPercent(0);
    let cancelled = false;
    try {
      const [[northEastLongitude, northEastLatitude], [southWestLongitude, southWestLatitude]] = visibleBounds;
      const finishedDownload = new Promise<void>((resolve, reject) => {
        const created = Mapbox.offlineManager.createPack(
          {
            name: id,
            styleURL: ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite,
            minZoom: 6,
            maxZoom: 15,
            bounds: [
              [northEastLongitude, northEastLatitude],
              [southWestLongitude, southWestLatitude],
            ],
            metadata: { title },
          },
          (_pack, status) => {
            setDownloadPercent(status.percentage ?? 0);
            if (status.state === 'complete') resolve();
          },
          (_pack, error) => reject(new Error(error.message)),
        );
        pendingDownloadRef.current = {
          id,
          created,
          cancel: () => {
            cancelled = true;
            resolve();
          },
        };
        void created.catch(reject);
      });
      await finishedDownload;
      if (cancelled) return;
      await saveOfflineMap({ id, title });
      setDownloadingMapId(null);
      await onDownloaded();
    } catch (error) {
      setDownloadingMapId(null);
      await removeOfflineMap(id).catch(() => undefined);
      errorToast(copy.mapDownloadFailed, error);
    } finally {
      if (pendingDownloadRef.current?.id === id) pendingDownloadRef.current = null;
    }
  }

  async function cancelMapDownload() {
    const pendingDownload = pendingDownloadRef.current;
    if (!downloadingMapId || !pendingDownload) return;
    pendingDownload.cancel();
    try {
      await pendingDownload.created.catch(() => undefined);
      await Mapbox.offlineManager.deletePack(downloadingMapId);
      await removeOfflineMap(downloadingMapId);
      setDownloadingMapId(null);
      await onDownloaded();
    } catch (error) {
      errorToast(copy.mapManagementFailed, error);
    }
  }

  return (
    <View style={styles.content}>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
        {copy.mapInstructions}
      </Text>
      <MapView
        ref={mapRef}
        testID="offline-region-map"
        style={styles.map}
        styleURL={ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite}
        onMapIdle={() => {
          void mapRef.current
            ?.getVisibleBounds()
            .then((bounds) => setVisibleBounds(bounds as OfflineBounds))
            .catch(() => undefined);
        }}>
        <Camera defaultSettings={{ centerCoordinate, zoomLevel: 9 }} />
      </MapView>
      <TextInput
        accessibilityLabel={copy.regionName}
        mode="outlined"
        label={copy.regionName}
        placeholder={copy.regionPlaceholder}
        testID="offline-region-name"
        value={regionName}
        onChangeText={setRegionName}
      />
      <View style={styles.downloadActions}>
        <Button
          mode="contained"
          testID="download-offline-region"
          disabled={!visibleBounds || Boolean(downloadingMapId)}
          loading={Boolean(downloadingMapId)}
          onPress={downloadVisibleRegion}>
          {downloadingMapId ? `${copy.downloading} ${Math.round(downloadPercent)}%` : copy.downloadRegion}
        </Button>
        {downloadingMapId ? (
          <Button mode="text" onPress={() => void cancelMapDownload()}>
            {copy.cancelDownload}
          </Button>
        ) : null}
      </View>
      {downloadingMapId ? <ActivityIndicator accessibilityLabel={copy.downloading} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  map: { borderRadius: 16, height: 300, overflow: 'hidden' },
  downloadActions: { alignItems: 'center', gap: 4 },
});
