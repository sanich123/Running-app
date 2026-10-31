import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Mapbox, { Camera, MapView, UserLocation } from '@rnmapbox/maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import MapControlButton from '@S/map-control-button/map-control-button';
import { successToast } from '@S/success-toast/success-toast';
import { saveOfflineMap, removeOfflineMap } from '@U/offline-map-library';
import {
  DOWNLOAD_PROGRESS_CENTER,
  DOWNLOAD_PROGRESS_CIRCUMFERENCE,
  DOWNLOAD_PROGRESS_RADIUS,
  DOWNLOAD_PROGRESS_SIZE,
  DOWNLOAD_PROGRESS_STROKE,
} from './const';
import MapControls from '../../map-controls/map-controls';
import MapSearchPanel from '../../map-search-panel/map-search-panel';
import type { MapRegionDownloaderProps, OfflineDownloadProgress } from './types';
import type { OfflineBounds } from '../../const';

export default function MapRegionDownloader({
  centerCoordinate,
  copy,
  onDownloaded,
  onClose,
  embedded = false,
  initialVisibleBounds,
}: MapRegionDownloaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const pendingDownloadRef = useRef<{ id: string; created: Promise<void>; cancel: () => void } | null>(null);
  const lastProgressRef = useRef<OfflineDownloadProgress>({});
  const snapPoints = useMemo(() => (embedded ? ['40%', '68%', '90%'] : ['9%', '35%', '62%']), [embedded]);
  const [regionName, setRegionName] = useState('');
  const [visibleBounds, setVisibleBounds] = useState<OfflineBounds | null>(initialVisibleBounds ?? null);
  const [downloadingMapId, setDownloadingMapId] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [isSatellite, setIsSatellite] = useState(false);
  const [is3d, setIs3d] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" {...props} />
    ),
    [],
  );

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
    const title = regionName.trim();
    if (!visibleBounds || !title || downloadingMapId) return;
    const [northEast, southWest] = visibleBounds;
    const longitudeSpanDegrees = (northEast[0] - southWest[0] + 360) % 360;
    const latitudeSpanDegrees = northEast[1] - southWest[1];
    const boundsValues = [...northEast, ...southWest];
    const boundsValuesAreValid =
      boundsValues.every(Number.isFinite) &&
      northEast[0] >= -180 &&
      northEast[0] <= 180 &&
      southWest[0] >= -180 &&
      southWest[0] <= 180 &&
      northEast[1] >= -90 &&
      northEast[1] <= 90 &&
      southWest[1] >= -90 &&
      southWest[1] <= 90;
    const requestDiagnostics = {
      style: isSatellite ? 'satellite' : 'map',
      minZoom: 6,
      maxZoom: 16,
      boundsOrder: 'northEast,southWest',
      boundsValid: boundsValuesAreValid && latitudeSpanDegrees > 0 && longitudeSpanDegrees > 0,
      latitudeSpanDegrees: Number(latitudeSpanDegrees.toFixed(4)),
      longitudeSpanDegrees: Number(longitudeSpanDegrees.toFixed(4)),
    };
    const id = `runich-region-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setDownloadingMapId(id);
    setDownloadPercent(0);
    lastProgressRef.current = {};
    let cancelled = false;
    try {
      const [[northEastLongitude, northEastLatitude], [southWestLongitude, southWestLatitude]] = visibleBounds;
      const finishedDownload = new Promise<void>((resolve, reject) => {
        const created = Mapbox.offlineManager.createPack(
          {
            name: id,
            styleURL: isSatellite ? ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite : ACTIVITY_ROUTE_REPLAY_MAP_STYLES.map,
            minZoom: 6,
            maxZoom: 16,
            bounds: [
              [northEastLongitude, northEastLatitude],
              [southWestLongitude, southWestLatitude],
            ],
            metadata: { title },
          },
          (_pack, status) => {
            if ('completedResourceCount' in status) {
              lastProgressRef.current = {
                completedResourceCount: status.completedResourceCount,
                erroredResourceCount: status.erroredResourceCount,
                requiredResourceCount: status.requiredResourceCount,
                loadedResourceCount: status.loadedResourceCount,
              };
            }
            if (!cancelled) setDownloadPercent(status.percentage ?? 0);
            if (status.state === 'complete') resolve();
          },
          (_pack, downloadError) => {
            const error = Object.assign(new Error(downloadError.message), {
              diagnostics: {
                regionId: downloadError.name,
                progress: lastProgressRef.current,
                request: requestDiagnostics,
              },
            });
            reject(error);
          },
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
      if (!cancelled) {
        if (error && typeof error === 'object' && 'diagnostics' in error) {
          console.error(`[Mapbox offline download] ${getErrorMessageFromError(error)}`);
        }
        errorToast(copy.mapDownloadFailed, error);
      }
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

  async function zoomMapBy(direction: 1 | -1) {
    try {
      const currentZoom = await mapRef.current?.getZoom();
      if (typeof currentZoom !== 'number') return;
      cameraRef.current?.zoomTo(Math.min(22, Math.max(0, currentZoom + direction)), 250);
    } catch {
      // Ignore zoom reads while the map is still initializing.
    }
  }

  return (
    <View style={embedded ? styles.embeddedPage : styles.page}>
      {!embedded ? (
        <MapView
          ref={mapRef}
          testID="offline-region-map"
          style={StyleSheet.absoluteFill}
          surfaceView={false}
          scaleBarEnabled={false}
          styleURL={isSatellite ? ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite : ACTIVITY_ROUTE_REPLAY_MAP_STYLES.map}
          logoPosition={{ top: insets.top + 56, right: 16 }}
          attributionPosition={{ top: insets.top + 56, left: 16 }}
          onMapIdle={() => {
            void mapRef.current
              ?.getVisibleBounds()
              .then((bounds) => setVisibleBounds(bounds as OfflineBounds))
              .catch(() => undefined);
          }}>
          <UserLocation visible />
          <Camera
            ref={cameraRef}
            defaultSettings={{ centerCoordinate, zoomLevel: 11, pitch: is3d ? 58 : 0 }}
            followUserLocation={false}
          />
        </MapView>
      ) : null}
      <View pointerEvents="box-none" style={styles.overlay}>
        {onClose && !embedded ? (
          <View style={[styles.modalCloseButton, { left: 16, top: insets.top + 12 }]}>
            <MapControlButton
              testID="close-offline-map-modal"
              androidIcon="close"
              iosSymbol="xmark"
              accessibilityLabel={copy.close}
              onPress={onClose}
            />
          </View>
        ) : null}
        {!embedded ? (
          <View style={[styles.mapControls, { right: 16, top: insets.top + 112 }]}>
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
              onZoomIn={() => void zoomMapBy(1)}
              onZoomOut={() => void zoomMapBy(-1)}
            />
          </View>
        ) : null}
        <BottomSheet
          index={0}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose={embedded}
          backdropComponent={embedded ? renderBackdrop : undefined}
          onChange={(index) => {
            if (embedded && index < 0) onClose?.();
          }}
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
            <View style={styles.regionDownloadRow}>
              <TextInput
                accessibilityLabel={copy.regionName}
                mode="outlined"
                label={copy.regionName}
                placeholder={copy.regionPlaceholder}
                style={[styles.regionNameInput, { backgroundColor: colors.surface }]}
                contentStyle={styles.regionNameInputContent}
                outlineStyle={styles.regionNameInputOutline}
                outlineColor={colors.outlineVariant}
                activeOutlineColor={colors.primary}
                textColor={colors.onSurface}
                render={(props) => <BottomSheetTextInput {...props} />}
                testID="offline-region-name"
                value={regionName}
                onChangeText={setRegionName}
              />
              {downloadingMapId ? (
                <View style={styles.downloadProgressControls}>
                  <View
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityLabel={copy.downloading}
                    accessibilityValue={{ min: 0, max: 100, now: Math.max(0, Math.min(100, downloadPercent)) }}
                    style={styles.downloadProgressCircle}
                    testID="offline-map-download-progress">
                    <Svg width={DOWNLOAD_PROGRESS_SIZE} height={DOWNLOAD_PROGRESS_SIZE} style={StyleSheet.absoluteFill}>
                      <Circle
                        cx={DOWNLOAD_PROGRESS_CENTER}
                        cy={DOWNLOAD_PROGRESS_CENTER}
                        r={DOWNLOAD_PROGRESS_RADIUS}
                        fill="none"
                        stroke={colors.outlineVariant}
                        strokeWidth={DOWNLOAD_PROGRESS_STROKE}
                      />
                      <Circle
                        cx={DOWNLOAD_PROGRESS_CENTER}
                        cy={DOWNLOAD_PROGRESS_CENTER}
                        r={DOWNLOAD_PROGRESS_RADIUS}
                        fill="none"
                        stroke={colors.primary}
                        strokeLinecap="round"
                        strokeWidth={DOWNLOAD_PROGRESS_STROKE}
                        strokeDasharray={`${DOWNLOAD_PROGRESS_CIRCUMFERENCE} ${DOWNLOAD_PROGRESS_CIRCUMFERENCE}`}
                        strokeDashoffset={
                          DOWNLOAD_PROGRESS_CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, downloadPercent)) / 100)
                        }
                        transform={`rotate(-90 ${DOWNLOAD_PROGRESS_CENTER} ${DOWNLOAD_PROGRESS_CENTER})`}
                      />
                    </Svg>
                    <View pointerEvents="none" style={styles.downloadProgressPercent}>
                      <Text
                        variant="labelSmall"
                        style={{ color: colors.onSurface, fontFamily: FONT_FAMILIES.semiBold }}>
                        {Math.round(downloadPercent)}%
                      </Text>
                    </View>
                  </View>
                  <IconButton
                    icon="close"
                    accessibilityLabel={copy.cancelDownload}
                    onPress={() => void cancelMapDownload()}
                    style={styles.cancelDownloadButton}
                    testID="cancel-offline-map-download"
                  />
                </View>
              ) : (
                <IconButton
                  mode="contained"
                  icon="download"
                  iconColor={colors.onPrimary}
                  containerColor={colors.primary}
                  accessibilityLabel={copy.downloadRegion}
                  testID="download-offline-region"
                  disabled={!visibleBounds || !regionName.trim()}
                  onPress={() => void downloadVisibleRegion()}
                  style={styles.startDownloadButton}
                />
              )}
            </View>
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
  embeddedPage: { ...StyleSheet.absoluteFill, zIndex: 3 },
  overlay: { ...StyleSheet.absoluteFill, elevation: 1, zIndex: 1 },
  mapControls: { position: 'absolute' },
  modalCloseButton: { position: 'absolute' },
  sheetContainer: { elevation: 2, zIndex: 2 },
  sheetBackground: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHandle: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { gap: 12, paddingBottom: 24, paddingHorizontal: 16, paddingTop: 4 },
  regionNameInputContent: { fontFamily: FONT_FAMILIES.regular },
  regionNameInputOutline: { borderRadius: 8 },
  regionDownloadRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  regionNameInput: { flex: 1, minHeight: 52, minWidth: 0, fontSize: 15 },
  startDownloadButton: { height: 44, margin: 0, width: 52 },
  downloadProgressControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  downloadProgressCircle: {
    alignItems: 'center',
    height: DOWNLOAD_PROGRESS_SIZE,
    justifyContent: 'center',
    width: DOWNLOAD_PROGRESS_SIZE,
  },
  downloadProgressPercent: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  cancelDownloadButton: { height: 40, margin: 0, width: 40 },
});
