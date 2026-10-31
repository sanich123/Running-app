import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { Platform, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';
import BatteryOptimizationModal from '@Routes/activity/battery-optimization-modal/battery-optimization-modal';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import RouteKilometreMarkers from '@S/display-activity-map/route-kilometre-markers/route-kilometre-markers';
import MapControlButton from '@S/map-control-button/map-control-button';
import ActivityMapContext from './activity-map-context';
import LocationPermissions from './location-permissions/location-permissions';
import MapControls from './map-controls/map-controls';
import MapNavIcon from './map-nav-icon/map-nav-icon';
import PauseMarkers from './pause-markers/pause-markers';
import useActivityMap from './use-activity-map';
import type { OfflineBounds } from '@Routes/maps-page/const';
import type { ActivityLocation } from '@S/card/types';

export default function Map({
  onLocationReadinessChange,
  navigationRoute,
  hasNavigationTrack = Boolean(navigationRoute?.length),
  isNavigationRouteVisible = true,
  onToggleNavigationRouteVisibility,
  onFinishNavigation,
  showImportedRouteLabel,
  hideImportedRouteLabel,
  finishNavigationLabel,
  downloadOfflineMapLabel,
  onDownloadOfflineMap,
}: {
  onLocationReadinessChange: (isReady: boolean) => void;
  navigationRoute?: ActivityLocation[];
  hasNavigationTrack?: boolean;
  isNavigationRouteVisible?: boolean;
  onToggleNavigationRouteVisibility?: () => void;
  onFinishNavigation?: () => void;
  showImportedRouteLabel?: string;
  hideImportedRouteLabel?: string;
  finishNavigationLabel?: string;
  downloadOfflineMapLabel?: string;
  onDownloadOfflineMap?: (bounds: OfflineBounds, centerCoordinate: [number, number]) => void;
}) {
  const { colors } = useTheme();
  const {
    canRenderMap,
    isLoadingLocationPrerequisites,
    isMapVisible,
    locationSourceMessage,
    activityMapContext,
    mapViewProps: { currentPosition, cameraRef, cameraDefaultSettings },
  } = useActivityMap(onLocationReadinessChange);
  const hasMapLoaded = useRef(false);
  const mapRef = useRef<MapView>(null);
  const navigationBounds = useMemo(
    () =>
      navigationRoute?.reduce<{
        east: number;
        north: number;
        south: number;
        west: number;
        pointCount: number;
      } | null>((bounds, { coords }) => {
        const { latitude, longitude } = coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return bounds;
        return bounds
          ? {
              east: Math.max(bounds.east, longitude),
              north: Math.max(bounds.north, latitude),
              south: Math.min(bounds.south, latitude),
              west: Math.min(bounds.west, longitude),
              pointCount: bounds.pointCount + 1,
            }
          : { east: longitude, north: latitude, south: latitude, west: longitude, pointCount: 1 };
      }, null) ?? null,
    [navigationRoute],
  );
  const routeOfflineBounds = useMemo<OfflineBounds | null>(
    () =>
      navigationBounds && navigationBounds.pointCount >= 2
        ? [
            [navigationBounds.east, navigationBounds.north],
            [navigationBounds.west, navigationBounds.south],
          ]
        : null,
    [navigationBounds],
  );

  const openOfflineMapDownloader = useCallback(() => {
    if (!routeOfflineBounds || !onDownloadOfflineMap) return;

    const centerCoordinate: [number, number] = [
      (routeOfflineBounds[0][0] + routeOfflineBounds[1][0]) / 2,
      (routeOfflineBounds[0][1] + routeOfflineBounds[1][1]) / 2,
    ];

    const mapView = mapRef.current;
    if (!mapView) {
      onDownloadOfflineMap(routeOfflineBounds, centerCoordinate);
      return;
    }

    void mapView.getVisibleBounds().then(
      (bounds) => {
        onDownloadOfflineMap(bounds as OfflineBounds, centerCoordinate);
      },
      () => onDownloadOfflineMap(routeOfflineBounds, centerCoordinate),
    );
  }, [onDownloadOfflineMap, routeOfflineBounds]);

  const fitNavigationRoute = useCallback(() => {
    if (!canRenderMap || !isNavigationRouteVisible || !navigationBounds || navigationBounds.pointCount < 2) return;
    if (!cameraRef.current) return;

    cameraRef.current.fitBounds(
      [navigationBounds.east, navigationBounds.north],
      [navigationBounds.west, navigationBounds.south],
      [56, 56, 56, 56],
      500,
    );
  }, [cameraRef, canRenderMap, isNavigationRouteVisible, navigationBounds]);

  const onMapLoaded = useCallback(() => {
    hasMapLoaded.current = true;
    fitNavigationRoute();
  }, [fitNavigationRoute]);

  useEffect(() => {
    if (hasMapLoaded.current) fitNavigationRoute();
  }, [fitNavigationRoute]);

  return (
    <ActivityMapContext.Provider value={activityMapContext}>
      {isLoadingLocationPrerequisites ? (
        <View style={[styles.permissionLoading, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" testID="activity-permissions-loading" />
        </View>
      ) : canRenderMap ? (
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}
            scaleBarEnabled={false}
            onDidFinishLoadingMap={onMapLoaded}>
            <UserLocation
              visible={!currentPosition}
              animated
              {...(Platform.OS === 'android' ? { androidRenderMode: 'compass' as const } : {})}
            />
            <MapNavIcon />
            <Camera ref={cameraRef} defaultSettings={cameraDefaultSettings} followUserLocation={false} />
            <MapRouteLine />
            {navigationRoute?.length && isNavigationRouteVisible ? (
              <MapRouteLine locations={navigationRoute} variant="navigation" />
            ) : null}
            <PauseMarkers />
            <RouteKilometreMarkers />
          </MapView>
          {locationSourceMessage ? (
            <Surface
              testID="location-source-notice"
              accessibilityRole="alert"
              elevation={2}
              style={[styles.locationSourceNotice, { backgroundColor: colors.surface }]}>
              <Text variant="bodySmall" style={{ color: colors.onSurface }}>
                {locationSourceMessage}
              </Text>
            </Surface>
          ) : null}
          <View style={styles.navigationActions}>
            {hasNavigationTrack && onToggleNavigationRouteVisibility && onFinishNavigation ? (
              <>
                <MapControlButton
                  testID="toggle-imported-route-visibility"
                  androidIcon={isNavigationRouteVisible ? 'map' : 'map-outline'}
                  iosSymbol={isNavigationRouteVisible ? 'map.fill' : 'map'}
                  onPress={onToggleNavigationRouteVisibility}
                  accessibilityLabel={
                    isNavigationRouteVisible
                      ? (hideImportedRouteLabel ?? 'Hide imported route')
                      : (showImportedRouteLabel ?? 'Show imported route')
                  }
                />
                <MapControlButton
                  testID="finish-route-navigation"
                  androidIcon="close"
                  iosSymbol="xmark"
                  onPress={onFinishNavigation}
                  accessibilityLabel={finishNavigationLabel ?? 'Finish route navigation'}
                  iconColor={colors.primary}
                />
                {routeOfflineBounds && onDownloadOfflineMap ? (
                  <MapControlButton
                    testID="download-offline-map-for-route"
                    androidIcon="map"
                    iosSymbol="map.fill"
                    androidOverlayIcon="download"
                    iosOverlaySymbol="arrow.down.to.line"
                    onPress={openOfflineMapDownloader}
                    accessibilityLabel={downloadOfflineMapLabel ?? 'Download offline map around this route'}
                  />
                ) : null}
              </>
            ) : null}
          </View>
          <View style={styles.mapActions}>
            <MapControls />
            <BatteryOptimizationModal />
          </View>
        </View>
      ) : (
        <LocationPermissions />
      )}
    </ActivityMapContext.Provider>
  );
}

const styles = StyleSheet.create({
  mapWrapper: { flex: 1, position: 'relative' },
  locationSourceNotice: {
    alignSelf: 'center',
    borderRadius: 12,
    left: 12,
    maxWidth: '90%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  permissionLoading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  navigationActions: { bottom: 24, gap: 6, left: 12, position: 'absolute' },
  mapActions: { bottom: 24, gap: 6, position: 'absolute', right: 12 },
});
