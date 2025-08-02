import IconChooseSport from '@C/activity/icon-choose-sport/icon-choose-sport';
import Map from '@C/activity/map/map';
import PauseBtn from '@C/activity/pause-btn/pause-btn';
import ShowMapBtn from '@C/activity/show-map-btn/show-map-btn';
import StartBtn from '@C/activity/start-btn/start-btn';
import Metrics from '@C/metrics/metrics';
import { useAppSelector } from '@R/typed-hooks';
import useStartStopTracking from '@U/hooks/use-start-stop-tracking';
import { STATUSES } from '@const/enums';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Activity() {
  const { colors } = useTheme();
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);
  useStartStopTracking();
  const [isReadyToRecordLocation, setIsReadyToRecordLocation] = useState(false);

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.layout} edges={['bottom']}>
        <View style={styles.map}>
          {(activityStatus === STATUSES.initial || isMapVisible) && (
            <Map setIsReadyToRecordLocation={setIsReadyToRecordLocation} />
          )}
          {activityStatus !== STATUSES.initial && <Metrics />}
        </View>
        <View style={[styles.metricsLayout, { backgroundColor: colors.surfaceVariant }]}>
          <View style={styles.metrics}>
            {activityStatus === STATUSES.initial && <IconChooseSport />}
            {activityStatus === STATUSES.paused && <PauseBtn />}
            <StartBtn isReadyToRecordLocation={isReadyToRecordLocation} />
            {activityStatus !== STATUSES.initial && <ShowMapBtn />}
          </View>
        </View>
      </SafeAreaView>
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
    height: '83%',
    width: '100%',
  },
  metricsLayout: {
    height: '17%',
    width: '100%',
  },
  metrics: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
