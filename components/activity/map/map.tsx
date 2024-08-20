import MapKmSplit from '@C/map-km-split/map-km-split';
import MapRouteLine from '@C/map-route-line/map-route-line';
import { useAppSelector } from '@R/typed-hooks';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { Platform, View } from 'react-native';

import LocationSettingsSwitcher from '../location-settings-switcher/location-settings-switcher';
import ForegroundLocationSwitcher from '../foregroud-location-switcher/foreground-location-switcher';
import { useEffect, useState } from 'react';
import { useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
import BackgroundLocationSwitcher from '../background-location-switcher/background-location-switcher';
//@ts-expect-error просто нет типов в пакете
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import BatteryOptimizationSwitcher from '../battery-optimization-switcher/battery-optimization-switcher';
import LocationIndicator from '../location-indicator/location-indicator';

export default function Map() {
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [isAppOptimizedByPhone, setIsAppOptimizedByPhone] = useState(true);

  useEffect(() => {
    if (isAppOptimizedByPhone) {
      BatteryOptEnabled().then((isEnabled: boolean) => setIsAppOptimizedByPhone(isEnabled));
    }
  }, [isAppOptimizedByPhone]);

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
          {!foregroundPermissionStatus?.granted && (
            <ForegroundLocationSwitcher
              foregroundPermissionStatus={!!foregroundPermissionStatus?.granted}
              requestForegroundPermission={requestForegroundPermission}
            />
          )}
          {!backgroundPermissionStatus?.granted && (
            <BackgroundLocationSwitcher
              backgroundPermissionStatus={!!backgroundPermissionStatus?.granted}
              requestBackgroundPermission={requestBackgroundPermission}
            />
          )}
          {isAppOptimizedByPhone && (
            <BatteryOptimizationSwitcher
              isAppOptimizedByPhone={isAppOptimizedByPhone}
              setIsAppOptimizedByPhone={setIsAppOptimizedByPhone}
            />
          )}
        </View>
      )}
    </>
  );
}
