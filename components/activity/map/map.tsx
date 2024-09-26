import MapKmSplit from '@C/activity/map/map-km-split/map-km-split';
import MapRouteLine from '@C/activity/map/map-route-line/map-route-line';
import { useAppSelector } from '@R/typed-hooks';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { Platform } from 'react-native';
import { useState } from 'react';
import { useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
import LocationIndicator from '../location-indicator/location-indicator';
import LocationPermissions from './location-permissions/location-permissions';

export default function Map() {
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [isAppOptimizedByPhone, setIsAppOptimizedByPhone] = useState(true);
  const [isNeedToRefreshPermission, setIsNeedToRefreshPermission] = useState(false);
  const isReadyToShowLocationOnMap =
    Platform.OS === 'android'
      ? isLocationEnabled &&
        foregroundPermissionStatus?.granted &&
        backgroundPermissionStatus?.granted &&
        !isAppOptimizedByPhone
      : foregroundPermissionStatus?.granted && backgroundPermissionStatus?.granted;

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
        <LocationPermissions
          isMapVisible={isMapVisible}
          isLocationEnabled={isLocationEnabled}
          isAppOptimizedByPhone={isAppOptimizedByPhone}
          isNeedToRefreshPermission={isNeedToRefreshPermission}
          foregroundPermissionStatus={foregroundPermissionStatus}
          backgroundPermissionStatus={backgroundPermissionStatus}
          setIsLocationEnabled={setIsLocationEnabled}
          requestForegroundPermission={requestForegroundPermission}
          setIsAppOptimizedByPhone={setIsAppOptimizedByPhone}
          setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
          requestBackgroundPermission={requestBackgroundPermission}
        />
      )}
    </>
  );
}
