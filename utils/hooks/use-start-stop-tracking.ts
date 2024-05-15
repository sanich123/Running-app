import { resetLocationsFromBackground, setEmptyLastArrayWhenPaused } from '@R/location/location';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { startLocationTracking, stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { saveMetricsFromBackgroundToRedux } from '@U/location/rn-background-geolocation/general-fn';
import { STATUSES } from '@const/enums';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import BackgroundGeolocation, { Subscription, Location } from 'react-native-background-geolocation';
const { initial, paused, started, continued } = STATUSES;

export default function useStartStopTracking() {
  const { activityStatus } = useAppSelector(({ location }) => location);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const onLocation: Subscription = BackgroundGeolocation.onLocation((location: Location) =>
        saveMetricsFromBackgroundToRedux(location),
      );

      BackgroundGeolocation.ready({
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        disableStopDetection: true,
        distanceFilter: 10,
        stopTimeout: 5,
        stopOnTerminate: true, // <-- Allow the background-service to continue tracking when user closes the app.
      }).then((state) => console.log('- BackgroundGeolocation is configured and ready: ', state.enabled));

      return () => onLocation.remove();
    }
  }, []);

  useEffect(() => {
    if (activityStatus === started || activityStatus === continued) {
      if (Platform.OS === 'ios') {
        BackgroundGeolocation.start();
      } else {
        startLocationTracking();
      }
    } else {
      if (Platform.OS === 'ios') {
        BackgroundGeolocation.stop();
      } else {
        stopLocationTracking();
      }
    }
    if (activityStatus === initial) {
      dispatch(resetLocationsFromBackground());
    }
    if (activityStatus === paused) {
      dispatch(setEmptyLastArrayWhenPaused());
    }
  }, [activityStatus]);

  return { activityStatus };
}
