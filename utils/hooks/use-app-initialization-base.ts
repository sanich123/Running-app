import { useEffect } from 'react';
import { addEventListener } from '@react-native-community/netinfo';
import { Appearance } from 'react-native';
import { changeNetworkState } from '@R/slices/network/network';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';

export default function useAppInitializationBase() {
  const { theme } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const networkListener = addEventListener((networkState) => dispatch(changeNetworkState(networkState)));
    return () => networkListener();
  }, [dispatch]);

  useEffect(() => {
    if (theme) Appearance.setColorScheme?.(theme);
  }, [theme]);
}
