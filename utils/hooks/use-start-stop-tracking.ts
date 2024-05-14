import { resetLocationsFromBackground, setEmptyLastArrayWhenPaused } from '@R/location/location';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { saveMetricsFromBackgroundToRedux } from '@U/background-location/utiils';
import { STATUSES } from '@const/enums';
import { useEffect } from 'react';
import BackgroundGeolocation, { Subscription, Location } from 'react-native-background-geolocation';
const { initial, paused, started, continued } = STATUSES;

export default function useStartStopTracking() {
  const { activityStatus } = useAppSelector(({ location }) => location);
  const dispatch = useAppDispatch();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (activityStatus === started || activityStatus === continued) {
      BackgroundGeolocation.start();
    }
    if (activityStatus === initial) {
      BackgroundGeolocation.stop();
      dispatch(resetLocationsFromBackground());
    }
    if (activityStatus === paused) {
      BackgroundGeolocation.stop();
      dispatch(setEmptyLastArrayWhenPaused());
    }
  }, [activityStatus]);

  return { activityStatus };
}
