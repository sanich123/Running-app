import { useEffect } from 'react';
import { addEventListener } from '@react-native-community/netinfo';
import Mapbox from '@rnmapbox/maps';
import mapboxgl from 'mapbox-gl';
import { Appearance, Platform } from 'react-native';
import { changeNetworkState } from '@R/slices/network/network';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';

export default function useAppInitialization() {
  const { theme } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || null);
    } else {
      mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
    }
  }, []);

  useEffect(() => {
    const networkListener = addEventListener((networkState) => dispatch(changeNetworkState(networkState)));
    return () => networkListener();
  }, [dispatch]);

  useEffect(() => {
    if (theme) Appearance.setColorScheme(theme);
  }, [theme]);
}
