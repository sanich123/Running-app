/* eslint-disable import-x/no-named-as-default-member */
import { useEffect, useState } from 'react';
import { addEventListener } from '@react-native-community/netinfo';
import Mapbox from '@rnmapbox/maps';
import * as SplashScreen from 'expo-splash-screen';
import mapboxgl from 'mapbox-gl';
import { Appearance, Platform } from 'react-native';
import { errorToast } from '@C/shared/error-toast/error-toast';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import { changeNetworkState } from '@R/slices/network/network';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';

export default function useInitialState() {
  const [hasAccessToken, setHasAccessToken] = useState<boolean | null>(null);
  const [verifyToken, { data: configInfo, isLoading, isError, isSuccess, isUninitialized, error }] =
    useLazyVerifyConfigQuery();
  const { theme } = useAppSelector(({ language }) => language);
  const { accessToken } = useAppSelector(({ auth }) => auth);
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
    (async () => {
      if (!accessToken) {
        setHasAccessToken(false);
        return;
      }

      setHasAccessToken(true);
      try {
        await verifyToken({ accessToken }).unwrap();
      } catch (error) {
        errorToast('Не удалось проверить авторизацию', error);
      }
    })();
  }, [accessToken, dispatch, verifyToken]);

  useEffect(() => {
    if (isSuccess || hasAccessToken === false) {
      SplashScreen.hide();
    }
  }, [configInfo, dispatch, hasAccessToken, isSuccess]);

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
    hasAccessToken,
  };
}
