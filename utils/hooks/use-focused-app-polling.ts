import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

export default function useFocusedAppPolling(isEnabled: boolean, intervalMs: number, onPoll: () => void) {
  const onPollRef = useRef(onPoll);

  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  useFocusEffect(
    useCallback(() => {
      if (!isEnabled) return;

      let interval: ReturnType<typeof setInterval> | null = null;
      const stopPolling = () => {
        if (!interval) return;
        clearInterval(interval);
        interval = null;
      };
      const startPolling = () => {
        if (interval || AppState.currentState !== 'active') return;
        interval = setInterval(() => onPollRef.current(), intervalMs);
      };

      startPolling();
      const appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') startPolling();
        else stopPolling();
      });

      return () => {
        stopPolling();
        appStateSubscription.remove();
      };
    }, [intervalMs, isEnabled]),
  );
}
