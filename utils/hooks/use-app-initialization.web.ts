import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import useAppInitializationBase from './use-app-initialization-base';

export default function useAppInitialization() {
  useAppInitializationBase();

  useEffect(() => {
    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
  }, []);
}
