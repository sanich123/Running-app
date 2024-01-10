import { useAuth } from '@A/context/auth-context';
import { setIsAppShuted, setActivityStatus } from '@R/location/location';
import { changeNetworkState } from '@R/network/network';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getData } from '@U/async-storage';
import { STATUSES } from '@const/enums';
import NetInfo from '@react-native-community/netinfo';
import Mapbox from '@rnmapbox/maps';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function Page() {
  const { user } = useAuth();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const dispatch = useAppDispatch();

  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || null);

  useEffect(() => {
    const networkListener = NetInfo.addEventListener((networkState) => {
      dispatch(changeNetworkState(networkState));
    });
    return () => networkListener();
  }, []);

  if (!user) {
    console.log('redirecting to login');
    return <Redirect href="/sign-in" />;
  } else if (user) {
    getData('language');
    if (activityStatus !== STATUSES.initial) {
      dispatch(setIsAppShuted(true));
      dispatch(setActivityStatus(STATUSES.paused));
      return <Redirect href="/(tabs)/activity/" />;
    }
    console.log('redirect to home');
    return <Redirect href="/home/" />;
  }
  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
