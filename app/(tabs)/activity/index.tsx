import LocationIndicator from '@C/activity/location-indicator/location-indicator';
import Map from '@C/activity/map/map';
import PauseBtn from '@C/activity/pause-btn/pause-btn';
import ShowMapBtn from '@C/activity/show-map-btn/show-map-btn';
import StartBtn from '@C/activity/start-btn/start-btn';
import Metrics from '@C/metrics/metrics';
import { useAppSelector } from '@R/typed-hooks';
import useStartStopTracking from '@U/hooks/use-start-stop-tracking';
import { STATUSES } from '@const/enums';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function Activity() {
  const { colors } = useTheme();
  useStartStopTracking();
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);

  return (
    <>
      <View className="flex-1 items-center justify-center">
        <LocationIndicator />
        <View className="h-4/5 w-full">
          {(activityStatus === STATUSES.initial || isMapVisible) && <Map />}
          {activityStatus !== STATUSES.initial && <Metrics />}
        </View>
        <View className="h-1/5 w-full">
          <View
            className="flex flex-row items-center justify-center h-full gap-x-4"
            style={{ backgroundColor: colors.surfaceVariant }}>
            {activityStatus === STATUSES.paused && <PauseBtn />}
            <StartBtn />
            {activityStatus !== STATUSES.initial && <ShowMapBtn />}
          </View>
        </View>
      </View>
    </>
  );
}
