import { useEffect } from 'react';
import Mapbox from '@rnmapbox/maps';
import useAppInitializationBase from './use-app-initialization-base';

export default function useAppInitialization() {
  useAppInitializationBase();

  useEffect(() => {
    Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || null);
  }, []);
}
