import { useEffect, useRef, useState } from 'react';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { getCurrentPositionAsync, useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
// @ts-expect-error package has no types
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { Platform, StyleSheet, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import BatteryOptimizationModal from '@Routes/activity/battery-optimization-modal/battery-optimization-modal';
import MapKmSplit from '@Routes/activity/map/map-km-split/map-km-split';
import MapRouteLine from '@Routes/activity/map/map-route-line/map-route-line';
import { errorToast } from '@S/error-toast/error-toast';
import LocationIndicator from '../location-indicator/location-indicator';
import LocationPermissions from './location-permissions/location-permissions';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function Map({ setIsReadyToRecordLocation }: { setIsReadyToRecordLocation: (arg: boolean) => void }) {
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { colors } = useTheme();
  const { data: profile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [isNeedToRefreshPermission, setIsNeedToRefreshPermission] = useState(false);
  const [isBatteryOptimizationEnabled, setIsBatteryOptimizationEnabled] = useState(false);
  const [isFollowingUserLocation, setIsFollowingUserLocation] = useState(true);
  const cameraRef = useRef<Camera>(null);
  const batteryOptimizationModalRef = useRef<BottomSheetModal>(null);
  const hasLocationPermissions = Boolean(
    foregroundPermissionStatus?.granted && backgroundPermissionStatus?.granted && profile,
  );
  const isReadyToShowLocationOnMap = Boolean(
    hasLocationPermissions && (Platform.OS !== 'android' || isLocationEnabled),
  );
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
      {isReadyToShowLocationOnMap ? (
        <View style={styles.mapWrapper}>
          <LocationIndicator />
          <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
            {Platform.OS === 'ios' ? <UserLocation animated /> : <UserLocation androidRenderMode="compass" animated />}
            <Camera
              ref={cameraRef}
              followUserLocation={isFollowingUserLocation}
              followZoomLevel={18}
              animationMode="flyTo"
            />
            <MapKmSplit kilometresSplit={kilometresSplit} />
            {locationsWithPauses[0]?.length > 1
              ? locationsWithPauses.map((locations) => {
                  if (locations?.length > 1) {
                    const key = `${locations[0].coords.longitude}, ${locations[locations.length - 1].coords.latitude}`;
                    return <MapRouteLine key={key} locations={locations} />;
                  }
                })
              : null}
          </MapView>
          <View style={styles.mapActions}>
            <IconButton
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
  mapActions: { bottom: 24, gap: 6, position: 'absolute', right: 12 },
});
