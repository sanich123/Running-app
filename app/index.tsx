import { useAuth } from '@A/context/auth-context';
import { setIsAppShuted, setActivityStatus } from '@R/location/location';
import { changeNetworkState } from '@R/network/network';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import NetInfo from '@react-native-community/netinfo';
import Mapbox from '@rnmapbox/maps';
import { Redirect } from 'expo-router';
import mapboxgl from 'mapbox-gl';
import { useEffect } from 'react';
import { Appearance, Platform } from 'react-native';

export default function Page() {
  const { user } = useAuth();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const { theme } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (theme) Appearance.setColorScheme(theme);
  }, [theme]);
  
  useEffect(() => {
    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
    if (Platform.OS !== 'web') {
      Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || null);
    }
    const networkListener = NetInfo.addEventListener((networkState) => {
      dispatch(changeNetworkState(networkState));
    });
    return () => networkListener();
  }, [dispatch]);

  if (!user) {
    return <Redirect href="/sign-in" />;
  } else if (user) {
    if (activityStatus !== STATUSES.initial) {
      dispatch(setIsAppShuted(true));
      dispatch(setActivityStatus(STATUSES.paused));
      return <Redirect href="/activity" />;
    }
    return <Redirect href="/home" />;
  }
}
