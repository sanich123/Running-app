import ChooseSportModal from '@C/activity/choose-sport-modal/choose-sport-modal';
import IconChooseSport from '@C/activity/icon-choose-sport/icon-choose-sport';
import LocationIndicator from '@C/activity/location-indicator/location-indicator';
import Map from '@C/activity/map/map';
import PauseBtn from '@C/activity/pause-btn/pause-btn';
import ShowMapBtn from '@C/activity/show-map-btn/show-map-btn';
import StartBtn from '@C/activity/start-btn/start-btn';
import Metrics from '@C/metrics/metrics';
import { useAppSelector } from '@R/typed-hooks';
import useStartStopTracking from '@U/hooks/use-start-stop-tracking';
import { STATUSES } from '@const/enums';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import LocationEnabledModal from '@C/activity/location-enabled-modal/location-enabled-modal';
import ForegroundLocationModal from '@C/activity/foreground-location-modal/foreground-location-modal';
import BackgroundLocationModal from '@C/activity/background-location-modal/background-location-modal';
import BatteryOptimizationModal from '@C/activity/battery-optimization-modal/battery-optimization-modal';
//@ts-expect-error просто нет типов в пакете
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { useForegroundPermissions, useBackgroundPermissions, hasServicesEnabledAsync } from 'expo-location';

export default function Activity() {
  const { colors } = useTheme();
  const [visibilityOfSportIcon, setVisibilityOfSportIcon] = useState(true);
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);
  useStartStopTracking();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const locationEnabledModalRef = useRef<BottomSheetModal>(null);
  const foregroundLocationEnableModalRef = useRef<BottomSheetModal>(null);
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const batteryOptimizationEnabledModalRef = useRef<BottomSheetModal>(null);

  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [foregroudPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [isAppOptimizedByPhone, setIsAppOptimizedByPhone] = useState(false);
  const [userGetBackFromEnablingLocation, setUserGetBackFromEnablingLocation] = useState(false);
  const [userGetBackToApp, setUserGetBackToApp] = useState(false);

  async function isLocationServicesEnabled() {
    const isLocationServicesEnabled = await hasServicesEnabledAsync();
    setIsLocationEnabled(isLocationServicesEnabled);
    if (!isLocationServicesEnabled) {
      setTimeout(() => locationEnabledModalRef.current?.present(), 500);
    }
  }
  useEffect(() => {
    if (userGetBackFromEnablingLocation && !isLocationEnabled) {
      isLocationServicesEnabled();
      setUserGetBackFromEnablingLocation(false);
    }
  }, [isLocationEnabled, userGetBackFromEnablingLocation]);

  useEffect(() => {
    isLocationServicesEnabled();
  }, []);

  useEffect(() => {
    if (isLocationEnabled && foregroudPermissionStatus) {
      if (!foregroudPermissionStatus.granted) {
        foregroundLocationEnableModalRef.current?.present();
      }
    }
  }, [foregroudPermissionStatus, isLocationEnabled]);

  useEffect(() => {
    if (isLocationEnabled && foregroudPermissionStatus && backgroundPermissionStatus) {
      if (foregroudPermissionStatus.granted && !backgroundPermissionStatus.granted) {
        backgroundLocationEnabledModalRef.current?.present();
      }
    }
  }, [foregroudPermissionStatus, isLocationEnabled, backgroundPermissionStatus]);

  useEffect(() => {
    if (
      (isLocationEnabled && foregroudPermissionStatus?.granted && backgroundPermissionStatus?.granted) ||
      (userGetBackToApp && !isAppOptimizedByPhone)
    ) {
      BatteryOptEnabled().then((isEnabled: boolean) => {
        if (isEnabled) {
          setIsAppOptimizedByPhone(true);
          batteryOptimizationEnabledModalRef.current?.present();
        }
        setUserGetBackToApp(false);
      });
    }
  }, [
    foregroudPermissionStatus,
    isLocationEnabled,
    backgroundPermissionStatus,
    userGetBackToApp,
    isAppOptimizedByPhone,
  ]);

  const isReadyToShowLocationOnMap =
    isLocationEnabled &&
    foregroudPermissionStatus?.granted &&
    backgroundPermissionStatus?.granted &&
    !isAppOptimizedByPhone;

  return (
    <BottomSheetModalProvider>
      <View style={styles.layout}>
        {isReadyToShowLocationOnMap && <LocationIndicator />}

        <ChooseSportModal
          bottomSheetModalRef={bottomSheetModalRef}
          setVisibilityOfSportIcon={setVisibilityOfSportIcon}
        />

        <LocationEnabledModal
          locationEnabledModalRef={locationEnabledModalRef}
          setUserGetBackFromEnablingLocation={setUserGetBackFromEnablingLocation}
        />

        <ForegroundLocationModal
          foregroundLocationEnableModalRef={foregroundLocationEnableModalRef}
          requestForegroundPermission={requestForegroundPermission}
        />
        <BackgroundLocationModal
          backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
          requestBackgroundPermission={requestBackgroundPermission}
        />
        <BatteryOptimizationModal
          batteryOptimizationEnabledModalRef={batteryOptimizationEnabledModalRef}
          setIsAppOptimizedByPhone={setIsAppOptimizedByPhone}
          setUserGetBackToApp={setUserGetBackToApp}
        />

        <View style={styles.map}>
          {(activityStatus === STATUSES.initial || isMapVisible) && (
            <Map isReadyToShowLocationOnMap={isReadyToShowLocationOnMap} />
          )}
          {activityStatus !== STATUSES.initial && <Metrics />}
        </View>
        <View style={[styles.metricsLayout, { backgroundColor: colors.secondaryContainer }]}>
          {activityStatus === STATUSES.initial && (
            <IconChooseSport
              bottomSheetModalRef={bottomSheetModalRef}
              setVisibilityOfSportIcon={setVisibilityOfSportIcon}
              visibilityOfSportIcon={visibilityOfSportIcon}
            />
          )}

          <View style={[styles.metrics, { backgroundColor: colors.secondaryContainer }]}>
            {activityStatus === STATUSES.paused && <PauseBtn />}
            <StartBtn />
            {activityStatus !== STATUSES.initial && <ShowMapBtn />}
          </View>
        </View>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    height: '80%',
    width: '100%',
  },
  metricsLayout: {
    position: 'relative',
    height: '20%',
    width: '100%',
  },
  metrics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});
