import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useGetCurrentSubscriptionQuery } from '@R/services/subscription/subscription';
import { setSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';

export default function SubscriptionStatusSync() {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { networkState } = useAppSelector(({ network }) => network);
  const isNetworkAvailable = Boolean(networkState.isConnected && networkState.isInternetReachable !== false);
  const wasNetworkAvailable = useRef(isNetworkAvailable);
  const { data, isSuccess, refetch } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (isSuccess && data) dispatch(setSubscriptionSnapshot(data));
  }, [data, dispatch, isSuccess]);

  useEffect(() => {
    if (isNetworkAvailable && !wasNetworkAvailable.current && userId) void refetch();
    wasNetworkAvailable.current = isNetworkAvailable;
  }, [isNetworkAvailable, refetch, userId]);

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', (appState) => {
      if (appState === 'active' && isNetworkAvailable && userId) void refetch();
    });
    return () => appStateListener.remove();
  }, [isNetworkAvailable, refetch, userId]);

  return null;
}
