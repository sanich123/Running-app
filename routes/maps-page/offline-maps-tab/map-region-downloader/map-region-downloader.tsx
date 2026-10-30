import { useEffect, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Mapbox, { Camera, MapView, UserLocation } from '@rnmapbox/maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput, useTheme } from 'react-native-paper';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { saveOfflineMap, removeOfflineMap } from '@U/offline-map-library';
import MapControls from '../../map-controls/map-controls';
import MapSearchPanel from '../../map-search-panel/map-search-panel';
import type { MapsPageCopy, OfflineBounds } from '../../const';

export default function MapRegionDownloader({
  centerCoordinate,
  copy,
  onDownloaded,
}: {
  centerCoordinate: [number, number];
  copy: MapsPageCopy;
  onDownloaded?: () => Promise<void>;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const pendingDownloadRef = useRef<{ id: string; created: Promise<void>; cancel: () => void } | null>(null);
  const snapPoints = useMemo(() => ['9%', '35%', '62%'], []);
  const [regionName, setRegionName] = useState('');
  const [visibleBounds, setVisibleBounds] = useState<OfflineBounds | null>(null);
  const [downloadingMapId, setDownloadingMapId] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [isSatellite, setIsSatellite] = useState(false);
  const [is3d, setIs3d] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(
    () => () => {
      const pendingDownload = pendingDownloadRef.current;
      if (!pendingDownload) return;
      pendingDownload.cancel();
      void pendingDownload.created
        .then(() => Mapbox.offlineManager.deletePack(pendingDownload.id))
        .catch(() => undefined);
    },
    [],
  );

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
            styleURL: isSatellite ? ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite : ACTIVITY_ROUTE_REPLAY_MAP_STYLES.map,
            minZoom: 6,
            maxZoom: 15,
            bounds: [
              [northEastLongitude, northEastLatitude],
              [southWestLongitude, southWestLatitude],
            ],
            metadata: { title },
          },
          (_pack, status) => {
            if (!cancelled) setDownloadPercent(status.percentage ?? 0);
            if (status.state === 'complete') resolve();
          },
          (_pack, downloadError) => reject(new Error(downloadError.message)),
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
      if (cancelled) {
        await Mapbox.offlineManager.deletePack(id).catch(() => undefined);
        await removeOfflineMap(id).catch(() => undefined);
        return;
      }
      setDownloadingMapId(null);
      pendingDownloadRef.current = null;
      successToast(copy.mapDownloadSucceeded);
      await onDownloaded?.();
    } catch (error) {
      if (!cancelled) setDownloadingMapId(null);
      await Mapbox.offlineManager.deletePack(id).catch(() => undefined);
      await removeOfflineMap(id).catch(() => undefined);
      if (!cancelled) errorToast(copy.mapDownloadFailed, error);
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
    } catch (error) {
      errorToast(copy.mapManagementFailed, error);
    }
  }

  return (
    <View style={styles.page}>
      <MapView
        ref={mapRef}
        testID="offline-region-map"
        style={StyleSheet.absoluteFill}
        surfaceView={false}
        styleURL={isSatellite ? ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite : ACTIVITY_ROUTE_REPLAY_MAP_STYLES.map}
        logoPosition={{ top: insets.top + 56, left: 16 }}
        attributionPosition={{ top: insets.top + 56, left: 120 }}
        onMapIdle={() => {
          void mapRef.current
            ?.getVisibleBounds()
            .then((bounds) => setVisibleBounds(bounds as OfflineBounds))
            .catch(() => undefined);
        }}>
        <UserLocation visible />
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate, zoomLevel: 9, pitch: is3d ? 58 : 0 }}
          followUserLocation={false}
        />
      </MapView>
      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={[styles.mapControls, { right: 16, top: insets.top + 62 }]}>
          <MapControls
            copy={copy}
            isSatellite={isSatellite}
            is3d={is3d}
            onToggleMapStyle={() => setIsSatellite((current) => !current)}
            onTogglePitch={() => {
              setIs3d((current) => {
                const nextValue = !current;
                cameraRef.current?.setCamera({ pitch: nextValue ? 58 : 0, animationDuration: 350 });
                return nextValue;
              });
            }}
            onLocate={() => cameraRef.current?.setCamera({ centerCoordinate, zoomLevel: 12, animationDuration: 650 })}
            onSearch={() => setIsSearchVisible(true)}
          />
        </View>
        <BottomSheet
          index={0}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          bottomInset={0}
          containerStyle={styles.sheetContainer}
          backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.surface }]}
          handleStyle={[styles.sheetHandle, { backgroundColor: colors.surface }]}
          handleIndicatorStyle={{ backgroundColor: colors.outline }}>
          <BottomSheetScrollView contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}>
            <Text variant="titleMedium" style={{ color: colors.onSurface }}>
              {copy.downloadRegion}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.mapRegionInfo}
            </Text>
            <TextInput
              accessibilityLabel={copy.regionName}
              mode="outlined"
              dense
              label={copy.regionName}
              placeholder={copy.regionPlaceholder}
              render={(props) => <BottomSheetTextInput {...props} />}
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
                onPress={() => void downloadVisibleRegion()}>
                {downloadingMapId ? `${copy.downloading} ${Math.round(downloadPercent)}%` : copy.downloadRegion}
              </Button>
              {downloadingMapId ? (
                <Button mode="text" onPress={() => void cancelMapDownload()}>
                  {copy.cancelDownload}
                </Button>
              ) : null}
            </View>
            {downloadingMapId ? <ActivityIndicator accessibilityLabel={copy.downloading} /> : null}
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.mapZoomInfo}
            </Text>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
      <MapSearchPanel
        visible={isSearchVisible}
        copy={copy}
        onDismiss={() => setIsSearchVisible(false)}
        onSelectLocation={(coordinate) =>
          cameraRef.current?.setCamera({ centerCoordinate: coordinate, zoomLevel: 12, animationDuration: 650 })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, elevation: 1, zIndex: 1 },
  mapControls: { position: 'absolute' },
  sheetContainer: { elevation: 2, zIndex: 2 },
  sheetBackground: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHandle: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { gap: 12, paddingBottom: 24, paddingHorizontal: 16, paddingTop: 4 },
  downloadActions: { alignItems: 'center', gap: 2 },
});
