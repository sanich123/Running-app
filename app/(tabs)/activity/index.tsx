import ChooseSportModal from '@C/activity/choose-sport-modal/choose-sport-modal';
import IconChooseSport from '@C/activity/icon-choose-sport/icon-choose-sport';
import Map from '@C/activity/map/map';
import PauseBtn from '@C/activity/pause-btn/pause-btn';
import ShowMapBtn from '@C/activity/show-map-btn/show-map-btn';
import StartBtn from '@C/activity/start-btn/start-btn';
import Metrics from '@C/metrics/metrics';
import { useAppSelector } from '@R/typed-hooks';
import useStartStopTracking from '@U/hooks/use-start-stop-tracking';
import { STATUSES } from '@const/enums';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import BackgroundLocationModal from '@C/activity/background-location-modal/background-location-modal';
import BatteryOptimizationModal from '@C/activity/battery-optimization-modal/battery-optimization-modal';

export default function Activity() {
  const { colors } = useTheme();
  const [visibilityOfSportIcon, setVisibilityOfSportIcon] = useState(true);
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);
  useStartStopTracking();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const batteryOptimizationEnabledModalRef = useRef<BottomSheetModal>(null);

  return (
    <BottomSheetModalProvider>
      <View style={styles.layout}>

        <ChooseSportModal
          bottomSheetModalRef={bottomSheetModalRef}
          setVisibilityOfSportIcon={setVisibilityOfSportIcon}
        />
        <BackgroundLocationModal
          backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
        />
        <BatteryOptimizationModal
          batteryOptimizationEnabledModalRef={batteryOptimizationEnabledModalRef}

        />

        <View style={styles.map}>
          {(activityStatus === STATUSES.initial || isMapVisible) && <Map />}
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
