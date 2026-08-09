import { useMemo, useRef, useEffect } from 'react';
import { Map as MapboxMap } from 'mapbox-gl';
import { useTheme } from 'react-native-paper';
import { COLORS } from '@const/theme-colors';
import type { LastKmSplit } from '@R/slices/location/types';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxWeb({
  boundBox,
  routeCoordinates,
  kilometresSplit,
}: {
  boundBox: [number, number, number, number];
  routeCoordinates: number[][];
  kilometresSplit: LastKmSplit[];
}) {
  const { colors, dark } = useTheme();
  const mapRef = useRef<MapboxMap | null>(null);
  const mapNode = useRef<HTMLDivElement | null>(null);
  const kilometreSplitFeatures = useMemo(
    () =>
      (Array.isArray(kilometresSplit) ? kilometresSplit : [])
        .filter(({ kilometerPoint }) => {
          const { longitude, latitude } = kilometerPoint?.coords ?? {};
          return Number.isFinite(longitude) && Number.isFinite(latitude);
        })
        .map(({ kilometerPoint }, index) => ({
          type: 'Feature' as const,
          properties: { label: `${index + 1}` },
          geometry: {
            type: 'Point' as const,
            coordinates: [kilometerPoint.coords.longitude, kilometerPoint.coords.latitude],
          },
        })),
    [kilometresSplit],
  );

  useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;
    const mapboxMap = new MapboxMap({
      container: node,
      style: 'mapbox://styles/mapbox/standard',
      accessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '',
      config: {
        basemap: {
          lightPreset: dark ? 'night' : 'day',
        },
      },
      bounds: boundBox,
      boxZoom: true,
      fitBoundsOptions: { padding: { top: 20, bottom: 20, left: 20, right: 20 } },
    });
    mapRef.current = mapboxMap;
    mapboxMap.on('load', () => {
      mapboxMap.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
        },
      });
      mapboxMap.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': colors.primary,
          'line-width': 4,
        },
      });

      if (kilometreSplitFeatures.length) {
        mapboxMap.addSource('kilometre-splits', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: kilometreSplitFeatures,
          },
        });
        mapboxMap.addLayer({
          id: 'kilometre-split-background',
          type: 'circle',
          source: 'kilometre-splits',
          paint: {
            'circle-color': COLORS.light.surface,
            'circle-radius': 15,
            'circle-stroke-color': colors.primary,
            'circle-stroke-width': 2,
          },
        });
        mapboxMap.addLayer({
          id: 'kilometre-split-label',
          type: 'symbol',
          source: 'kilometre-splits',
          layout: {
            'text-allow-overlap': true,
            'text-field': ['get', 'label'],
            'text-ignore-placement': true,
            'text-size': 12,
          },
          paint: {
            'text-color': colors.primary,
          },
        });
      }
    });

    return () => {
      mapboxMap.remove();
      mapRef.current = null;
    };
  }, [boundBox, colors.primary, dark, kilometreSplitFeatures, routeCoordinates]);

  return <div ref={mapNode} style={{ flex: 1, width: '100%', minHeight: 0 }} />;
}
