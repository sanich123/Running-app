import { useAuth } from '@A/context/auth-context';
import { setIsAppShuted, setActivityStatus } from '@R/location/location';
import { changeNetworkState } from '@R/network/network';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import NetInfo from '@react-native-community/netinfo';
import Mapbox from '@rnmapbox/maps';
import { Redirect, usePathname } from 'expo-router';
import mapboxgl from 'mapbox-gl';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function Page() {
  const { user } = useAuth();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
  if (Platform.OS !== 'web') {
    Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || null);
  }
  useEffect(() => {
    const networkListener = NetInfo.addEventListener((networkState) => {
      dispatch(changeNetworkState(networkState));
    });
    return () => networkListener();
  }, []);
  console.log(pathname);
  if (!user) {
    return <Redirect href="/sign-in" />;
  } else if (user) {
    if (activityStatus !== STATUSES.initial) {
      dispatch(setIsAppShuted(true));
      dispatch(setActivityStatus(STATUSES.paused));
      return <Redirect href="/(tabs)/activity/" />;
    }
    return <Redirect href="/home/" />;
  }
}
