import { useMemo, useRef, useEffect } from 'react';
import { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl';
import { useTheme } from 'react-native-paper';
import { COLORS } from '@const/theme-colors';
import {
  ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION,
  ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL,
} from '@S/activity-route-replay/const';
import { getAvatarLabel } from '@S/avatar/avatar';
import type { WebMapControlsHandle } from '../map-controls/types';
import type { ActivityKilometreSplit, ProfileType } from '@S/card/types';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxWeb({
  boundBox,
  routeCoordinates,
  routeSegmentColors,
  kilometresSplit,
  showPlaybackMarker = false,
  playbackCoordinate,
  playbackHeading = 0,
  playbackCameraUpdateRef,
  playbackProfile,
  mapControlsRef,
  mapStyleURL = 'mapbox://styles/mapbox/standard',
  cameraPitch = 0,
  cameraZoomLevel = 14.5,
  enable3DTerrain = false,
  followPlaybackCamera = false,
}: {
  boundBox: [number, number, number, number];
  routeCoordinates: number[][];
  routeSegmentColors?: string[];
  kilometresSplit: ActivityKilometreSplit[];
  showPlaybackMarker?: boolean;
  playbackCoordinate?: [number, number] | null;
  playbackHeading?: number;
  playbackCameraUpdateRef?: {
    current:
      | ((coordinate: [number, number], heading: number, zoomLevel?: number, animationDurationMs?: number) => void)
      | null;
  };
  playbackProfile?: Pick<ProfileType, 'name' | 'surname' | 'profilePhoto'>;
  mapControlsRef?: { current: WebMapControlsHandle | null };
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
  const playbackProfileRef = useRef(playbackProfile);
  const playbackMarkerRef = useRef<MapboxMarker | null>(null);
  const playbackMarkerElementRef = useRef<HTMLDivElement | null>(null);
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
  const routeFeatures = useMemo(() => {
    if (!routeSegmentColors?.length) {
      return [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: { type: 'LineString' as const, coordinates: routeCoordinates },
        },
      ];
    }

    return routeSegmentColors.flatMap((color, index) => {
      const start = routeCoordinates[index];
      const end = routeCoordinates[index + 1];
      if (!start || !end) return [];

      return [
        {
          type: 'Feature' as const,
          properties: { color },
          geometry: { type: 'LineString' as const, coordinates: [start, end] },
        },
      ];
    });
  }, [routeCoordinates, routeSegmentColors]);

  useEffect(() => {
    playbackCoordinateRef.current = playbackCoordinate;
    playbackHeadingRef.current = playbackHeading;
  }, [playbackCoordinate, playbackHeading]);

  useEffect(() => {
    playbackProfileRef.current = playbackProfile;
    updateWebAvatarMarker(playbackMarkerElementRef.current, playbackProfile);
  }, [playbackProfile]);

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
    const mapControls = {
      zoomTo(zoomLevel: number, durationMs = 250) {
        mapboxMap.zoomTo(zoomLevel, { duration: durationMs });
      },
    };
    if (mapControlsRef) mapControlsRef.current = mapControls;
    let playbackCameraZoomLevel = cameraZoomLevel;
    const updatePlaybackCamera = (
      coordinate: [number, number],
      heading: number,
      zoomLevel?: number,
      animationDurationMs = 0,
    ) => {
      playbackMarkerRef.current?.setLngLat(coordinate);
      if (zoomLevel !== undefined) playbackCameraZoomLevel = zoomLevel;
      const cameraOptions = {
        center: coordinate,
        bearing: heading,
        pitch: cameraPitch,
        zoom: playbackCameraZoomLevel,
      };
      if (animationDurationMs > 0) {
        mapboxMap.easeTo({ ...cameraOptions, duration: animationDurationMs });
      } else {
        mapboxMap.jumpTo(cameraOptions);
      }
    };
    if (followPlaybackCamera && playbackCameraUpdateRef) {
      playbackCameraUpdateRef.current = updatePlaybackCamera;
    }
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
          type: 'FeatureCollection',
          features: routeFeatures,
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
          'line-color': routeSegmentColors?.length ? ['get', 'color'] : colors.primary,
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
        const initialCoordinate =
          playbackCoordinateRef.current ?? (routeCoordinates[0] as [number, number] | undefined);
        if (initialCoordinate) {
          const markerElement = document.createElement('div');
          markerElement.style.alignItems = 'center';
          markerElement.style.backgroundColor = colors.surface;
          markerElement.style.border = `2px solid ${colors.primary}`;
          markerElement.style.borderRadius = '50%';
          markerElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
          markerElement.style.display = 'flex';
          markerElement.style.height = '44px';
          markerElement.style.justifyContent = 'center';
          markerElement.style.overflow = 'hidden';
          markerElement.style.width = '44px';
          markerElement.setAttribute('aria-label', 'Activity route position');
          markerElement.setAttribute('data-testid', 'activity-route-moving-marker');
          updateWebAvatarMarker(markerElement, playbackProfileRef.current);
          playbackMarkerElementRef.current = markerElement;
          playbackMarkerRef.current = new MapboxMarker({ element: markerElement, anchor: 'center' })
            .setLngLat(initialCoordinate)
            .addTo(mapboxMap);
        }
      }
    });

    return () => {
      if (playbackCameraUpdateRef?.current === updatePlaybackCamera) {
        playbackCameraUpdateRef.current = null;
      }
      if (mapControlsRef?.current === mapControls) mapControlsRef.current = null;
      playbackMarkerRef.current?.remove();
      playbackMarkerRef.current = null;
      playbackMarkerElementRef.current = null;
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
    mapControlsRef,
    playbackCameraUpdateRef,
    routeCoordinates,
    routeFeatures,
    routeMarkerFeatures,
    routeSegmentColors,
    showPlaybackMarker,
  ]);

  useEffect(() => {
    if (!playbackCoordinate) return;
    if (showPlaybackMarker) playbackMarkerRef.current?.setLngLat(playbackCoordinate);
  }, [playbackCoordinate, showPlaybackMarker]);

  return <div ref={mapNode} style={{ flex: 1, width: '100%', minHeight: 0 }} />;
}

function updateWebAvatarMarker(
  element: HTMLDivElement | null,
  profile?: Pick<ProfileType, 'name' | 'surname' | 'profilePhoto'>,
) {
  if (!element) return;
  element.replaceChildren();

  if (profile?.profilePhoto) {
    const image = document.createElement('img');
    image.alt = '';
    image.draggable = false;
    image.src = profile.profilePhoto;
    image.style.borderRadius = '50%';
    image.style.height = '36px';
    image.style.objectFit = 'cover';
    image.style.width = '36px';
    element.append(image);
    return;
  }

  const initials = getAvatarLabel(profile?.name, profile?.surname);
  const fallback = document.createElement('span');
  fallback.textContent = initials || '👤';
  fallback.style.fontSize = initials ? '16px' : '22px';
  fallback.style.lineHeight = '36px';
  fallback.style.textAlign = 'center';
  fallback.style.width = '36px';
  element.append(fallback);
}
