import Mapbox from '@rnmapbox/maps';
import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../auth/context/auth-context';
import { STATUSES } from '../constants/enums';
import { setActivityStatus, setIsAppShuted } from '../redux/location/location';
import { getKeyFromAsyncStorage } from '../utils/async-storage';

export default function Page() {
  const { user } = useAuth();
  const { activityStatus } = useSelector(({ location }) => location);
  const dispatch = useDispatch();
  Mapbox.setWellKnownTileServer('Mapbox');
  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

  if (!user) {
    console.log('redirecting to login');
    return <Redirect href="/sign-in" />;
  } else if (user) {
    getKeyFromAsyncStorage('language');
    if (activityStatus !== STATUSES.initial) {
      dispatch(setIsAppShuted(true));
      dispatch(setActivityStatus(STATUSES.paused));
      return <Redirect href="/(tabs)/activity/" />;
    }
    console.log('redirect to home');
    return <Redirect href="/home" />;
  }

  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
