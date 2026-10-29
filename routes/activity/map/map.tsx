import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { Platform, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';
import BatteryOptimizationModal from '@Routes/activity/battery-optimization-modal/battery-optimization-modal';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import RouteKilometreMarkers from '@S/display-activity-map/route-kilometre-markers/route-kilometre-markers';
import ActivityMapContext from './activity-map-context';
import LocationPermissions from './location-permissions/location-permissions';
import MapControls from './map-controls/map-controls';
import MapNavIcon from './map-nav-icon/map-nav-icon';
import PauseMarkers from './pause-markers/pause-markers';
import useActivityMap from './use-activity-map';
import type { ActivityLocation } from '@S/card/types';

export default function Map({
  onLocationReadinessChange,
  navigationRoute,
}: {
  onLocationReadinessChange: (isReady: boolean) => void;
  navigationRoute?: ActivityLocation[];
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

  return (
    <ActivityMapContext.Provider value={activityMapContext}>
      {isLoadingLocationPrerequisites ? (
        <View style={[styles.permissionLoading, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" testID="activity-permissions-loading" />
        </View>
      ) : canRenderMap ? (
        <View style={styles.mapWrapper}>
          <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]} scaleBarEnabled={false}>
            <UserLocation
              visible={!currentPosition}
              animated
              {...(Platform.OS === 'android' ? { androidRenderMode: 'compass' as const } : {})}
            />
            <MapNavIcon />
            <Camera ref={cameraRef} defaultSettings={cameraDefaultSettings} followUserLocation={false} />
            {navigationRoute?.length ? <MapRouteLine locations={navigationRoute} variant="navigation" /> : null}
            <MapRouteLine />
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
  mapActions: { bottom: 24, gap: 6, position: 'absolute', right: 12 },
});
