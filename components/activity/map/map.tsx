import MapKmSplit from '@C/map-km-split/map-km-split';
import MapRouteLine from '@C/map-route-line/map-route-line';
import { useAppSelector } from '@R/typed-hooks';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { Platform, View } from 'react-native';

import LocationSettingsSwitcher from '../location-settings-switcher/location-settings-switcher';
import ForegroundLocationSwitcher from '../foregroud-location-switcher/foreground-location-switcher';
import { useRef, useState } from 'react';
import { useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
import BackgroundLocationSwitcher from '../background-location-switcher/background-location-switcher';
import BatteryOptimizationSwitcher from '../battery-optimization-switcher/battery-optimization-switcher';
import LocationIndicator from '../location-indicator/location-indicator';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BackgroundLocationModal from '../background-location-modal/background-location-modal';
import BatteryOptimizationModal from '../battery-optimization-modal/battery-optimization-modal';

export default function Map() {
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [isAppOptimizedByPhone, setIsAppOptimizedByPhone] = useState(true);
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const batteryOptimizationEnabledModalRef = useRef<BottomSheetModal>(null);
  const [isNeedToRefreshPermission, setIsNeedToRefreshPermission] = useState(false);
  const isReadyToShowLocationOnMap =
    isLocationEnabled &&
    foregroundPermissionStatus?.granted &&
    backgroundPermissionStatus?.granted &&
    !isAppOptimizedByPhone;

  return (
    <>
      {isReadyToShowLocationOnMap ? (
        <>
          <LocationIndicator />
          <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
            {Platform.OS === 'ios' ? (
              <UserLocation showsUserHeadingIndicator animated />
            ) : (
              <UserLocation showsUserHeadingIndicator androidRenderMode="compass" animated />
            )}
            <Camera followUserLocation followZoomLevel={18} animationMode="flyTo" />
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
        </>
      ) : (
        <View
          style={[{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }, isMapVisible && { height: '60%' }]}>
          {!isLocationEnabled && (
            <LocationSettingsSwitcher
              isLocationEnabled={isLocationEnabled}
              setIsLocationEnabled={setIsLocationEnabled}
            />
          )}
          {foregroundPermissionStatus && !foregroundPermissionStatus?.granted && (
            <ForegroundLocationSwitcher
              foregroundPermissionStatus={foregroundPermissionStatus}
              requestForegroundPermission={requestForegroundPermission}
            />
          )}
          {!backgroundPermissionStatus?.granted && (
            <BackgroundLocationSwitcher
              backgroundPermissionStatus={!!backgroundPermissionStatus?.granted}
              backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
            />
          )}
          {isAppOptimizedByPhone && (
            <BatteryOptimizationSwitcher
              isAppOptimizedByPhone={isAppOptimizedByPhone}
              setIsAppOptimizedByPhone={setIsAppOptimizedByPhone}
              batteryOptimizationEnabledModalRef={batteryOptimizationEnabledModalRef}
              setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
              isNeedToRefreshPermission={isNeedToRefreshPermission}
            />
          )}
          <BackgroundLocationModal
            backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
            requestBackgroundPermission={requestBackgroundPermission}
          />
          <BatteryOptimizationModal
            batteryOptimizationEnabledModalRef={batteryOptimizationEnabledModalRef}
            setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
          />
        </View>
      )}
    </>
  );
}
