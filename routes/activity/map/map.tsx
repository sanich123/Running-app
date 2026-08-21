import { useEffect, useRef, useState } from 'react';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { getCurrentPositionAsync, useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
// @ts-expect-error package has no types
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { Platform, View, StyleSheet } from 'react-native';
import { ActivityIndicator, IconButton, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import BatteryOptimizationModal from '@Routes/activity/battery-optimization-modal/battery-optimization-modal';
import MapKmSplit from '@S/display-activity-map/map-km-split/map-km-split';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import { errorToast } from '@S/error-toast/error-toast';
import LocationPermissions from './location-permissions/location-permissions';
import MapControls from './map-controls/map-controls';
import MapNavIcon from './map-nav-icon/map-nav-icon';
import PauseMarkers from './pause-markers/pause-markers';
import { distanceInMeters } from './utils';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Location as MapboxLocation } from '@rnmapbox/maps';
import type { LocationObject } from 'expo-location';

export default function Map({ onLocationReadinessChange }: { onLocationReadinessChange: (isReady: boolean) => void }) {
  const { isMapVisible, locationsWithPauses, kilometresSplit, lastPosition, initialLocation } = useAppSelector(
    ({ location }) => location,
  );
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isProfileFilled } = useAppSelector(({ settings }) => settings);
  const { profileFromServer } = useAppSelector(({ profile }) => profile);
  const { colors } = useTheme();
  const [isLocationServicesEnabled, setIsLocationServicesEnabled] = useState(false);
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [shouldRefreshPermissionStatus, setShouldRefreshPermissionStatus] = useState(false);
  const [isBatteryOptimizationActive, setIsBatteryOptimizationActive] = useState(false);
  const [isCenteringOnCurrentLocation, setIsCenteringOnCurrentLocation] = useState(false);
  const [shouldFollowUserLocation, setShouldFollowUserLocation] = useState(true);
  const [mapZoomLevel, setMapZoomLevel] = useState(18);
  const [mapboxLocation, setMapboxLocation] = useState<MapboxLocation | null>(null);
  const cameraRef = useRef<Camera>(null);
  const batteryOptimizationModalRef = useRef<BottomSheetModal>(null);
  const canUseLocation = Boolean(
    userId && foregroundPermissionStatus?.granted && backgroundPermissionStatus?.granted && isProfileFilled,
  );
  const canRenderMap = Boolean(canUseLocation && (Platform.OS !== 'android' || isLocationServicesEnabled));
  const isLoadingLocationPrerequisites = foregroundPermissionStatus === null || backgroundPermissionStatus === null;
  const currentPosition: LocationObject | null = lastPosition ?? initialLocation;
  const shouldShowMapboxLocation =
    !currentPosition || !mapboxLocation || distanceInMeters(currentPosition, mapboxLocation) > 10;
  useEffect(() => {
    onLocationReadinessChange(canUseLocation);
  }, [canUseLocation, onLocationReadinessChange]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !canUseLocation) {
      return;
    }

    BatteryOptEnabled()
      .then((isEnabled: boolean) => {
        setIsBatteryOptimizationActive(isEnabled);
        setShouldRefreshPermissionStatus(false);
      })
      .catch((error: unknown) => errorToast('Не удалось проверить оптимизацию батареи', error));
  }, [canUseLocation, shouldRefreshPermissionStatus]);

  const centerMapOnCurrentLocation = async () => {
    setIsCenteringOnCurrentLocation(true);
    try {
      const position = await getCurrentPositionAsync({ accuracy: 6 });
      setShouldFollowUserLocation(false);
      setMapZoomLevel(18);
      setTimeout(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: [position.coords.longitude, position.coords.latitude],
          zoomLevel: 18,
          animationMode: 'flyTo',
          animationDuration: 800,
        });
        setTimeout(() => setShouldFollowUserLocation(true), 900);
      }, 50);
    } catch (error) {
      errorToast('Не удалось определить текущее местоположение', error);
    } finally {
      setIsCenteringOnCurrentLocation(false);
    }
  };

  return (
    <>
      {isLoadingLocationPrerequisites ? (
        <View style={[styles.permissionLoading, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" testID="activity-permissions-loading" />
        </View>
      ) : canRenderMap ? (
        <View style={styles.mapWrapper}>
          <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
            <UserLocation
              visible={shouldShowMapboxLocation}
              animated
              onUpdate={setMapboxLocation}
              {...(Platform.OS === 'android' ? { androidRenderMode: 'compass' as const } : {})}
            />
            <MapNavIcon profilePhoto={profileFromServer?.profilePhoto} />
            <Camera
              ref={cameraRef}
              followUserLocation={shouldFollowUserLocation}
              followZoomLevel={mapZoomLevel}
              animationMode="flyTo"
            />
            <MapRouteLine locations={locationsWithPauses} />
            <PauseMarkers locations={locationsWithPauses} />
            <MapKmSplit kilometresSplit={kilometresSplit} />
          </MapView>
          <View style={styles.mapActions}>
            <MapControls
              cameraRef={cameraRef}
              mapZoomLevel={mapZoomLevel}
              isCenteringOnCurrentLocation={isCenteringOnCurrentLocation}
              onZoomLevelChange={setMapZoomLevel}
              onFollowUserLocationChange={setShouldFollowUserLocation}
              onCenterOnCurrentLocation={centerMapOnCurrentLocation}
            />
            {isBatteryOptimizationActive && (
              <IconButton
                testID="battery-optimization-info"
                mode="contained-tonal"
                icon="battery-alert-variant-outline"
                iconColor={colors.primary}
                containerColor={colors.surface}
                size={24}
                onPress={() => batteryOptimizationModalRef.current?.present()}
                accessibilityLabel="Информация об оптимизации батареи"
              />
            )}
          </View>
          <BatteryOptimizationModal
            batteryOptimizationEnabledModalRef={batteryOptimizationModalRef}
            setIsNeedToRefreshPermission={setShouldRefreshPermissionStatus}
          />
        </View>
      ) : (
        <LocationPermissions
          isMapVisible={isMapVisible}
          isLocationEnabled={isLocationServicesEnabled}
          foregroundPermissionStatus={foregroundPermissionStatus}
          backgroundPermissionStatus={backgroundPermissionStatus}
          setIsLocationEnabled={setIsLocationServicesEnabled}
          requestForegroundPermission={requestForegroundPermission}
          requestBackgroundPermission={requestBackgroundPermission}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mapWrapper: { flex: 1, position: 'relative' },
  permissionLoading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  mapActions: { bottom: 24, gap: 6, position: 'absolute', right: 12 },
});
