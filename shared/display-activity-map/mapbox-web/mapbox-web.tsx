import { useMemo, useRef, useEffect } from 'react';
import { Map as MapboxMap } from 'mapbox-gl';
import { useTheme } from 'react-native-paper';
import { COLORS } from '@const/theme-colors';
import {
  ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION,
  ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL,
} from '@S/activity-route-replay/const';
import type { ActivityKilometreSplit } from '@S/card/types';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxWeb({
  boundBox,
  routeCoordinates,
  kilometresSplit,
  showPlaybackMarker = false,
  playbackCoordinate,
  playbackHeading = 0,
  mapStyleURL = 'mapbox://styles/mapbox/standard',
  cameraPitch = 0,
  cameraZoomLevel = 14.5,
  enable3DTerrain = false,
  followPlaybackCamera = false,
}: {
  boundBox: [number, number, number, number];
  routeCoordinates: number[][];
  kilometresSplit: ActivityKilometreSplit[];
  showPlaybackMarker?: boolean;
  playbackCoordinate?: [number, number] | null;
  playbackHeading?: number;
  mapStyleURL?: string;
  cameraPitch?: number;
  cameraZoomLevel?: number;
  enable3DTerrain?: boolean;
  followPlaybackCamera?: boolean;
}) {
  const { colors, dark } = useTheme();
  const mapRef = useRef<MapboxMap | null>(null);
  const mapNode = useRef<HTMLDivElement | null>(null);
  const playbackCoordinateRef = useRef(playbackCoordinate);
  const playbackHeadingRef = useRef(playbackHeading);
  const lastPlaybackCameraUpdateAtRef = useRef(0);
  const kilometreSplitFeatures = useMemo(() => {
    const validKilometreSplits = (Array.isArray(kilometresSplit) ? kilometresSplit : []).filter(
      ({ kilometerPoint }) => {
        const { longitude, latitude } = kilometerPoint?.coords ?? {};
        return Number.isFinite(longitude) && Number.isFinite(latitude);
      },
    );

    return validKilometreSplits.map(({ kilometerPoint }, index) => ({
      type: 'Feature' as const,
      properties: { label: `${index + 1}`, sortKey: index },
      geometry: {
        type: 'Point' as const,
        coordinates: [kilometerPoint.coords.longitude, kilometerPoint.coords.latitude],
      },
    }));
  }, [kilometresSplit]);
  const routeMarkerFeatures = useMemo(() => {
    const start = routeCoordinates[0];
    const end = routeCoordinates[routeCoordinates.length - 1];
    if (!start || !end) return [];

    return [
      {
        type: 'Feature' as const,
        properties: { icon: '▶', markerType: 'start' },
        geometry: { type: 'Point' as const, coordinates: start },
      },
      {
        type: 'Feature' as const,
        properties: { icon: '■', markerType: 'end' },
        geometry: { type: 'Point' as const, coordinates: end },
      },
    ];
  }, [routeCoordinates]);

  useEffect(() => {
    playbackCoordinateRef.current = playbackCoordinate;
    playbackHeadingRef.current = playbackHeading;
  }, [playbackCoordinate, playbackHeading]);

  useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;
    const mapboxMap = new MapboxMap({
      container: node,
      style: mapStyleURL,
      accessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '',
      config: {
        basemap: {
          lightPreset: dark ? 'night' : 'day',
        },
      },
      ...(followPlaybackCamera && playbackCoordinateRef.current
        ? {
            center: playbackCoordinateRef.current,
            zoom: cameraZoomLevel,
            bearing: playbackHeadingRef.current,
          }
        : { bounds: boundBox }),
      pitch: cameraPitch,
      boxZoom: true,
      fitBoundsOptions: { padding: { top: 20, bottom: 20, left: 20, right: 20 } },
    });
    mapRef.current = mapboxMap;
    mapboxMap.on('load', () => {
      if (enable3DTerrain) {
        mapboxMap.addSource('activity-route-replay-terrain', {
          type: 'raster-dem',
          url: ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL,
          tileSize: 512,
          maxzoom: 14,
        });
        mapboxMap.setTerrain({
          source: 'activity-route-replay-terrain',
          exaggeration: ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION,
        });
      }

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
          layout: {
            'circle-sort-key': ['get', 'sortKey'],
          },
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
            'text-padding': 12,
            'text-size': 12,
            'symbol-sort-key': ['get', 'sortKey'],
          },
          paint: {
            'text-color': colors.primary,
          },
        });
      }

      mapboxMap.addSource('route-markers', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: routeMarkerFeatures,
        },
      });
      mapboxMap.addLayer({
        id: 'route-marker-background',
        type: 'circle',
        source: 'route-markers',
        paint: {
          'circle-color': colors.surface,
          'circle-radius': 18,
          'circle-stroke-color': ['match', ['get', 'markerType'], 'start', colors.tertiary, colors.error],
          'circle-stroke-width': 2,
        },
      });
      mapboxMap.addLayer({
        id: 'route-marker-icon',
        type: 'symbol',
        source: 'route-markers',
        layout: {
          'text-allow-overlap': true,
          'text-anchor': 'center',
          'text-field': ['get', 'icon'],
          'text-ignore-placement': true,
          'text-size': 18,
        },
        paint: {
          'text-color': ['match', ['get', 'markerType'], 'start', colors.tertiary, colors.error],
        },
      });

      if (showPlaybackMarker) {
        mapboxMap.addSource('route-playback-marker', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: playbackCoordinateRef.current ?? routeCoordinates[0] },
          },
        });
        mapboxMap.addLayer({
          id: 'route-playback-marker',
          type: 'circle',
          source: 'route-playback-marker',
          paint: {
            'circle-color': colors.primary,
            'circle-radius': 9,
            'circle-stroke-color': colors.surface,
            'circle-stroke-width': 3,
          },
        });
      }
    });

    return () => {
      mapboxMap.remove();
      mapRef.current = null;
    };
  }, [
    boundBox,
    colors.error,
    colors.primary,
    colors.surface,
    colors.tertiary,
    dark,
    mapStyleURL,
    cameraPitch,
    cameraZoomLevel,
    enable3DTerrain,
    followPlaybackCamera,
    kilometreSplitFeatures,
    routeCoordinates,
    routeMarkerFeatures,
    showPlaybackMarker,
  ]);

  useEffect(() => {
    if (!playbackCoordinate) return;
    const source = mapRef.current?.getSource('route-playback-marker');
    if (showPlaybackMarker && source && 'setData' in source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: playbackCoordinate },
      });
    }

    if (!followPlaybackCamera) return;
    const now = performance.now();
    if (now - lastPlaybackCameraUpdateAtRef.current < 100) return;
    const animationDuration = lastPlaybackCameraUpdateAtRef.current > 0 ? 120 : 0;
    lastPlaybackCameraUpdateAtRef.current = now;
    mapRef.current?.easeTo({
      center: playbackCoordinate,
      bearing: playbackHeading,
      pitch: cameraPitch,
      zoom: cameraZoomLevel,
      duration: animationDuration,
      essential: true,
    });
  }, [cameraPitch, cameraZoomLevel, followPlaybackCamera, playbackCoordinate, playbackHeading, showPlaybackMarker]);

  return <div ref={mapNode} style={{ flex: 1, width: '100%', minHeight: 0 }} />;
}
