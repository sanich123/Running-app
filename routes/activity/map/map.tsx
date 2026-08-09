import { useEffect, useRef, useState } from 'react';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { getCurrentPositionAsync, useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
// @ts-expect-error package has no types
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { setLastPosition } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import BatteryOptimizationModal from '@Routes/activity/battery-optimization-modal/battery-optimization-modal';
import MapKmSplit from '@S/display-activity-map/map-km-split/map-km-split';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import { errorToast } from '@S/error-toast/error-toast';
import LocationPermissions from './location-permissions/location-permissions';
import MapNavIcon from './map-nav-icon/map-nav-icon';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function Map({ setIsReadyToRecordLocation }: { setIsReadyToRecordLocation: (arg: boolean) => void }) {
  const dispatch = useAppDispatch();
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { colors } = useTheme();
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [isNeedToRefreshPermission, setIsNeedToRefreshPermission] = useState(false);
  const [isBatteryOptimizationEnabled, setIsBatteryOptimizationEnabled] = useState(false);
  const [isFollowingUserLocation, setIsFollowingUserLocation] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(18);
  const cameraRef = useRef<Camera>(null);
  const batteryOptimizationModalRef = useRef<BottomSheetModal>(null);
  const hasLocationPermissions = Boolean(
    foregroundPermissionStatus?.granted && backgroundPermissionStatus?.granted && profile,
  );
  const isReadyToShowLocationOnMap = Boolean(
    hasLocationPermissions && (Platform.OS !== 'android' || isLocationEnabled),
  );
  const isPermissionDataLoading =
    isProfileLoading || foregroundPermissionStatus === null || backgroundPermissionStatus === null;
  useEffect(() => {
    setIsReadyToRecordLocation(hasLocationPermissions);
  }, [hasLocationPermissions, setIsReadyToRecordLocation]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !hasLocationPermissions) {
      return;
    }

    BatteryOptEnabled()
      .then((isEnabled: boolean) => {
        setIsBatteryOptimizationEnabled(isEnabled);
        setIsNeedToRefreshPermission(false);
      })
      .catch((error: unknown) => errorToast('Не удалось проверить оптимизацию батареи', error));
  }, [hasLocationPermissions, isNeedToRefreshPermission]);

  const moveToCurrentLocation = async () => {
    try {
      const position = await getCurrentPositionAsync({ accuracy: 6 });
      setIsFollowingUserLocation(false);
      setZoomLevel(18);
      setTimeout(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: [position.coords.longitude, position.coords.latitude],
          zoomLevel: 18,
          animationMode: 'flyTo',
          animationDuration: 800,
        });
        setTimeout(() => setIsFollowingUserLocation(true), 900);
      }, 50);
    } catch (error) {
      errorToast('Не удалось определить текущее местоположение', error);
    }
  };

  return (
    <>
      {isPermissionDataLoading ? (
        <View style={[styles.permissionLoading, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" testID="activity-permissions-loading" />
        </View>
      ) : isReadyToShowLocationOnMap ? (
        <View style={styles.mapWrapper}>
          <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
            <UserLocation
              visible={false}
              animated
              onUpdate={(location) => dispatch(setLastPosition(location))}
              {...(Platform.OS === 'android' ? { androidRenderMode: 'compass' as const } : {})}
            />
            <MapNavIcon profilePhoto={profile?.profilePhoto} />
            <Camera
              ref={cameraRef}
              followUserLocation={isFollowingUserLocation}
              followZoomLevel={zoomLevel}
              animationMode="flyTo"
            />
            <MapRouteLine locations={locationsWithPauses} />
            <MapKmSplit kilometresSplit={kilometresSplit} />
          </MapView>
          <View style={styles.mapActions}>
            <IconButton
              testID="increase-map-zoom"
              mode="contained-tonal"
              icon="plus"
              iconColor={colors.primary}
              containerColor={colors.surface}
              size={24}
              disabled={zoomLevel >= 20}
              onPress={() => {
                const nextZoomLevel = Math.min(20, zoomLevel + 1);
                setZoomLevel(nextZoomLevel);
                setIsFollowingUserLocation(false);
                cameraRef.current?.setCamera({
                  zoomLevel: nextZoomLevel,
                  animationMode: 'easeTo',
                  animationDuration: 250,
                });
              }}
              accessibilityLabel="Увеличить масштаб карты"
            />
            <IconButton
              testID="decrease-map-zoom"
              mode="contained-tonal"
              icon="minus"
              iconColor={colors.primary}
              containerColor={colors.surface}
              size={24}
              disabled={zoomLevel <= 3}
              onPress={() => {
                const nextZoomLevel = Math.max(3, zoomLevel - 1);
                setZoomLevel(nextZoomLevel);
                setIsFollowingUserLocation(false);
                cameraRef.current?.setCamera({
                  zoomLevel: nextZoomLevel,
                  animationMode: 'easeTo',
                  animationDuration: 250,
                });
              }}
              accessibilityLabel="Уменьшить масштаб карты"
            />
            <IconButton
              testID="move-to-current-location"
              mode="contained-tonal"
              icon="crosshairs-gps"
              iconColor={colors.primary}
              containerColor={colors.surface}
              size={24}
              onPress={moveToCurrentLocation}
              accessibilityLabel="Текущее местоположение"
            />
            {isBatteryOptimizationEnabled && (
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
            setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
          />
        </View>
      ) : (
        <LocationPermissions
          isMapVisible={isMapVisible}
          isLocationEnabled={isLocationEnabled}
          foregroundPermissionStatus={foregroundPermissionStatus}
          backgroundPermissionStatus={backgroundPermissionStatus}
          setIsLocationEnabled={setIsLocationEnabled}
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
