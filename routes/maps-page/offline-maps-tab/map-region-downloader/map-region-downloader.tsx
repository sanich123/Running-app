import { useCallback, useMemo, useRef, useState } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Camera, FillLayer, LineLayer, MapView, ShapeSource, UserLocation } from '@rnmapbox/maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import MapControlButton from '@S/map-control-button/map-control-button';
import MapControls from '../../map-controls/map-controls';
import MapSearchPanel from '../../map-search-panel/map-search-panel';
import {
  DOWNLOAD_PROGRESS_CENTER,
  DOWNLOAD_PROGRESS_CIRCUMFERENCE,
  DOWNLOAD_PROGRESS_RADIUS,
  DOWNLOAD_PROGRESS_SIZE,
  DOWNLOAD_PROGRESS_STROKE,
  MAP_REGION_MAX_ZOOM,
} from './const';
import useMapRegionDownload from './use-map-region-download';
import type { OfflineBounds } from '../../const';
import type { MapRegionDownloaderProps } from './types';

export default function MapRegionDownloader({
  centerCoordinate,
  copy,
  onDownloaded,
  onClose,
  embedded = false,
  initialVisibleBounds,
  initialIsSatellite = false,
  previewOnly = false,
  previewTitle,
}: MapRegionDownloaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const snapPoints = useMemo(() => (embedded ? ['40%', '68%', '90%'] : ['9%', '35%', '62%']), [embedded]);
  const [regionName, setRegionName] = useState('');
  const [visibleBounds, setVisibleBounds] = useState<OfflineBounds | null>(initialVisibleBounds ?? null);
  const [isSatellite, setIsSatellite] = useState(initialIsSatellite);
  const [is3d, setIs3d] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { downloadingMapId, downloadPercent, downloadRegion, cancelMapDownload } = useMapRegionDownload({
    copy,
    isSatellite,
    onDownloaded,
  });
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" {...props} />
    ),
    [],
  );
  const cameraDefaultSettings = useMemo(
    () => ({
      ...(initialVisibleBounds
        ? {
            bounds: {
              ne: initialVisibleBounds[0],
              sw: initialVisibleBounds[1],
              paddingTop: insets.top + 72,
              paddingRight: 32,
              paddingBottom: 32,
              paddingLeft: 32,
            },
          }
        : { centerCoordinate, zoomLevel: 11 }),
      pitch: is3d ? 58 : 0,
    }),
    [centerCoordinate, initialVisibleBounds, insets.top, is3d],
  );
  const selectedBounds = previewOnly ? initialVisibleBounds : visibleBounds;
  const selectedRegion = useMemo(() => {
    if (embedded || !selectedBounds) return null;
    const [[northEastLongitude, northEastLatitude], [southWestLongitude, southWestLatitude]] = selectedBounds;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [southWestLongitude, northEastLatitude],
            [northEastLongitude, northEastLatitude],
            [northEastLongitude, southWestLatitude],
            [southWestLongitude, southWestLatitude],
            [southWestLongitude, northEastLatitude],
          ],
        ],
      },
    };
  }, [embedded, selectedBounds]);

  async function zoomMapBy(direction: 1 | -1) {
    try {
      const currentZoom = await mapRef.current?.getZoom();
      if (typeof currentZoom !== 'number') return;
      cameraRef.current?.zoomTo(Math.min(MAP_REGION_MAX_ZOOM, Math.max(0, currentZoom + direction)), 250);
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
          <UserLocation visible={!previewOnly} />
          {selectedRegion ? (
            <ShapeSource id="offline-map-region-preview" shape={selectedRegion}>
              <FillLayer
                id="offline-map-region-preview-fill"
                style={{ fillColor: colors.primary, fillOpacity: 0.12 }}
              />
              <LineLayer
                id="offline-map-region-preview-outline"
                style={{ lineColor: colors.primary, lineWidth: 3, lineOpacity: 1 }}
              />
            </ShapeSource>
          ) : null}
          <Camera
            ref={cameraRef}
            defaultSettings={cameraDefaultSettings}
            followUserLocation={false}
            maxZoomLevel={MAP_REGION_MAX_ZOOM}
          />
        </MapView>
      ) : null}
      <View pointerEvents="box-none" style={styles.overlay}>
        {onClose && !embedded ? (
          <View style={[styles.closeButton, { left: 16, top: insets.top + 12 }]}>
            <MapControlButton
              testID="close-offline-map-preview"
              androidIcon="close"
              iosSymbol="xmark"
              accessibilityLabel={copy.close}
              onPress={onClose}
            />
          </View>
        ) : null}
        {previewOnly && previewTitle ? (
          <View pointerEvents="none" style={[styles.previewTitle, { top: insets.top + 12 }]}>
            <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.onSurface }}>
              {previewTitle}
            </Text>
          </View>
        ) : null}
        {!embedded && !previewOnly ? (
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
        {!previewOnly ? (
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
              {downloadingMapId ? (
                <Text
                  variant="bodySmall"
                  style={{ color: colors.onSurfaceVariant }}
                  testID="offline-map-download-page-warning">
                  {copy.mapDownloadRequiresPageOpen}
                </Text>
              ) : null}
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
                      <Svg
                        width={DOWNLOAD_PROGRESS_SIZE}
                        height={DOWNLOAD_PROGRESS_SIZE}
                        style={StyleSheet.absoluteFill}>
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
                    onPress={() => void downloadRegion(regionName, visibleBounds)}
                    style={styles.startDownloadButton}
                  />
                )}
              </View>
            </BottomSheetScrollView>
          </BottomSheet>
        ) : null}
      </View>
      {!previewOnly ? (
        <MapSearchPanel
          visible={isSearchVisible}
          copy={copy}
          onDismiss={() => setIsSearchVisible(false)}
          onSelectLocation={(coordinate) =>
            cameraRef.current?.setCamera({ centerCoordinate: coordinate, zoomLevel: 12, animationDuration: 650 })
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  embeddedPage: { ...StyleSheet.absoluteFill, zIndex: 3 },
  overlay: { ...StyleSheet.absoluteFill, elevation: 1, zIndex: 1 },
  mapControls: { position: 'absolute' },
  closeButton: { position: 'absolute' },
  previewTitle: { alignItems: 'center', left: 68, position: 'absolute', right: 68 },
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
