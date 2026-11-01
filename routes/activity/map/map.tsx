import { useMemo, useRef, useState } from 'react';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { Platform, View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import BatteryOptimizationModal from '@Routes/activity/battery-optimization-modal/battery-optimization-modal';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import RouteKilometreMarkers from '@S/display-activity-map/route-kilometre-markers/route-kilometre-markers';
import ActivityMapContext from './activity-map-context';
import LocationPermissions from './location-permissions/location-permissions';
import LocationSourceNotice from './location-source-notice/location-source-notice';
import MapControls from './map-controls/map-controls';
import MapNavIcon from './map-nav-icon/map-nav-icon';
import NavigationControls from './navigation-controls/navigation-controls';
import NavigationRouteLayer from './navigation-route-layer/navigation-route-layer';
import PauseMarkers from './pause-markers/pause-markers';
import useActivityMap from './use-activity-map';
import type { OfflineBounds } from '@Routes/maps-page/const';

export default function Map({ onLocationReadinessChange }: { onLocationReadinessChange: (isReady: boolean) => void }) {
  const { colors } = useTheme();
  const {
    canRenderMap,
    isLoadingLocationPrerequisites,
    isMapVisible,
    locationSourceMessage,
    activityMapContext,
    mapViewProps: { currentPosition, cameraRef, cameraDefaultSettings },
  } = useActivityMap(onLocationReadinessChange);
  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  const mapRef = useRef<MapView>(null);
  const mapContextValue = useMemo(
    () => ({
      ...activityMapContext,
      readVisibleBounds: async (): Promise<OfflineBounds | null> => {
        const bounds = await mapRef.current?.getVisibleBounds();
        if (!bounds || bounds.length < 2) return null;
        const [northEast, southWest] = bounds;
        if (!northEast || !southWest || northEast.length < 2 || southWest.length < 2) return null;
        return [
          [northEast[0], northEast[1]],
          [southWest[0], southWest[1]],
        ];
      },
    }),
    [activityMapContext],
  );

  return (
    <ActivityMapContext.Provider value={mapContextValue}>
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
            onDidFinishLoadingMap={() => setHasMapLoaded(true)}>
            <UserLocation
              visible={!currentPosition}
              animated
              {...(Platform.OS === 'android' ? { androidRenderMode: 'compass' as const } : {})}
            />
            <MapNavIcon />
            <Camera ref={cameraRef} defaultSettings={cameraDefaultSettings} followUserLocation={false} />
            <MapRouteLine />
            <NavigationRouteLayer cameraRef={cameraRef} canRenderMap={canRenderMap} hasMapLoaded={hasMapLoaded} />
            <PauseMarkers />
            <RouteKilometreMarkers />
          </MapView>
          <LocationSourceNotice message={locationSourceMessage} />
          <NavigationControls />
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
  permissionLoading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  mapActions: { bottom: 24, gap: 6, position: 'absolute', right: 12 },
});
