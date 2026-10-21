import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { AppState } from 'react-native';
import { STATUSES } from '@const/enums';
import { setDurationAt, startDurationTimer } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getCurrentActivityDuration } from '@U/activity-duration';
import type { RootState } from '@R/store';

const TIMER_INTERVAL = 1_000;

export default function useActivityDurationTimer(isEnabled = true) {
  const dispatch = useAppDispatch();
  const appStore = useStore<RootState>();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const isRecording = activityStatus === STATUSES.started || activityStatus === STATUSES.continued;

  useEffect(() => {
    if (!isEnabled || !isRecording) {
      return;
    }

    const locationState = appStore.getState().location;
    if (typeof locationState.durationTimerStartedAt !== 'number') {
      dispatch(startDurationTimer(Date.now()));
    }

    const updateDuration = () => {
      const currentLocationState = appStore.getState().location;
      if (typeof currentLocationState.durationTimerStartedAt !== 'number') {
        return;
      }

      dispatch(setDurationAt(getCurrentActivityDuration(currentLocationState)));
    };

    updateDuration();
    const interval = setInterval(updateDuration, TIMER_INTERVAL);
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        updateDuration();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [appStore, dispatch, isEnabled, isRecording]);
}
