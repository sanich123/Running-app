import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Mapbox from '@rnmapbox/maps';
import * as SplashScreen from 'expo-splash-screen';
import mapboxgl from 'mapbox-gl';
import { Appearance, Platform } from 'react-native';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import { changeNetworkState } from '@R/slices/network/network';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';

export default function useInitialState() {
  const [verifyToken, { data: configInfo, isLoading, isError, isSuccess, isUninitialized, error }] =
    useLazyVerifyConfigQuery();
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
    const networkListener = NetInfo.addEventListener((networkState) => dispatch(changeNetworkState(networkState)));
    return () => networkListener();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      await verifyToken({ accessToken: accessToken ?? '' }).unwrap();
    })();
  }, [dispatch, verifyToken]);

  useEffect(() => {
    if (isSuccess) {
      SplashScreen.hide();
    }
  }, [configInfo, dispatch, isSuccess]);

  useEffect(() => {
    if (isError) {
      SplashScreen.hide();
    }
  }, [isError, error]);

  useEffect(() => {
    if (theme) {
      Appearance.setColorScheme(theme);
    }
  }, [theme]);

  return {
    isLoading,
    isError,
    isUninitialized,
    isSuccess,
  };
}
