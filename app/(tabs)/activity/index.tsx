import ActivityLocationIndicator from '@C/activity-location-indicator/activity-location-indicator';
import ActivityPauseBtn from '@C/activity-pause-btn/activity-pause-btn';
import ActivityShowMapBtn from '@C/activity-show-map-btn/activity-show-map-btn';
import ActivityStartBtn from '@C/activity-start-btn/activity-start-btn';
import Map from '@C/map/map';
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
        <ActivityLocationIndicator />
        <View className="h-4/5 w-full">
          {(activityStatus === STATUSES.initial || isMapVisible) && <Map />}
          {activityStatus !== STATUSES.initial && <Metrics />}
        </View>
        <View className="h-1/5 w-full">
          <View
            className="flex flex-row items-center justify-center h-full gap-x-4"
            style={{ backgroundColor: colors.surfaceVariant }}>
            {activityStatus === STATUSES.paused && <ActivityPauseBtn />}
            <ActivityStartBtn />
            {activityStatus !== STATUSES.initial && <ActivityShowMapBtn />}
          </View>
        </View>
      </View>
    </>
  );
}
