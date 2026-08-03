import { useEffect, useState } from 'react';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
import { Platform } from 'react-native';
import MapKmSplit from '@C/activity/map/map-km-split/map-km-split';
import MapRouteLine from '@C/activity/map/map-route-line/map-route-line';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import LocationIndicator from '../location-indicator/location-indicator';
import LocationPermissions from './location-permissions/location-permissions';

export default function Map({ setIsReadyToRecordLocation }: { setIsReadyToRecordLocation: (arg: boolean) => void }) {
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: profile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
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
        !isAppOptimizedByPhone &&
        profile
      : foregroundPermissionStatus?.granted && backgroundPermissionStatus?.granted && profile;
  useEffect(() => {
    if (isReadyToShowLocationOnMap) {
      setIsReadyToRecordLocation(true);
    }
  }, [isReadyToShowLocationOnMap, setIsReadyToRecordLocation]);

  return (
    <>
      {isReadyToShowLocationOnMap ? (
        <>
          <LocationIndicator />
          <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
            {Platform.OS === 'ios' ? <UserLocation animated /> : <UserLocation androidRenderMode="compass" animated />}
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
