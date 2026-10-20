import { useMemo, useRef, useEffect } from 'react';
import { AttributionControl, Map as MapboxMap, Marker as MapboxMarker, Popup as MapboxPopup } from 'mapbox-gl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import {
  ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION,
  ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL,
} from '@S/activity-route-replay/const';
import { DISPLAY_ACTIVITY_MAP_CAMERA_PADDING } from '../const';
import {
  getRouteSpeedGradient,
  getKilometreSplitFeatures,
  getRouteBaseFeatures,
  getRouteFeatures,
  updateMapboxBrandingPosition,
  styleKilometrePopup,
  updateWebAvatarMarker,
} from './utils';
import type { MapboxWebProps } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxWeb({
  boundBox,
  routeCoordinates,
  routeSegmentColors,
  kilometresSplit,
  kilometreUnit = 'km',
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
}: MapboxWebProps) {
  const { colors, dark } = useTheme();
  const { bottom: safeAreaBottomInset } = useSafeAreaInsets();
  const mapRef = useRef<MapboxMap | null>(null);
  const brandingBottomInsetRef = useRef(safeAreaBottomInset);
  const mapNode = useRef<HTMLDivElement | null>(null);
  const playbackCoordinateRef = useRef(playbackCoordinate);
  const playbackHeadingRef = useRef(playbackHeading);
  const playbackProfileRef = useRef(playbackProfile);
  const playbackMarkerRef = useRef<MapboxMarker | null>(null);
  const playbackMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const kilometrePopupRef = useRef<MapboxPopup | null>(null);
  const kilometreSplitFeatures = useMemo(() => getKilometreSplitFeatures(kilometresSplit), [kilometresSplit]);
  const routeBaseFeatures = useMemo(
    () => getRouteBaseFeatures(routeCoordinates, routeSegmentColors),
    [routeCoordinates, routeSegmentColors],
  );
  const routeFeatures = useMemo(() => getRouteFeatures(routeCoordinates), [routeCoordinates]);
  const routeSpeedGradient = useMemo(
    () => getRouteSpeedGradient(routeCoordinates, routeSegmentColors ?? []),
    [routeCoordinates, routeSegmentColors],
  );

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
      attributionControl: false,
      logoPosition: 'bottom-left',
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
      fitBoundsOptions: {
        padding: {
          top: DISPLAY_ACTIVITY_MAP_CAMERA_PADDING.paddingTop,
          bottom: DISPLAY_ACTIVITY_MAP_CAMERA_PADDING.paddingBottom,
          left: DISPLAY_ACTIVITY_MAP_CAMERA_PADDING.paddingLeft,
          right: DISPLAY_ACTIVITY_MAP_CAMERA_PADDING.paddingRight,
        },
      },
    });
    const mapResizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            mapboxMap.resize();
          });
    mapResizeObserver?.observe(node);
    mapRef.current = mapboxMap;
    brandingBottomInsetRef.current = safeAreaBottomInset;
    mapboxMap.addControl(new AttributionControl({ compact: true }), 'bottom-left');
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
      updateMapboxBrandingPosition(mapboxMap, brandingBottomInsetRef.current);
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

      if (routeBaseFeatures.length) {
        mapboxMap.addSource('route-base', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: routeBaseFeatures,
          },
        });
        mapboxMap.addLayer({
          id: 'route-base-line',
          type: 'line',
          source: 'route-base',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': colors.primary,
            'line-width': 4,
          },
        });
      }

      mapboxMap.addSource('route', {
        type: 'geojson',
        lineMetrics: Boolean(routeSpeedGradient),
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
          'line-color': colors.primary,
          'line-emissive-strength': 1,
          'line-width': 5,
          ...(routeSpeedGradient ? { 'line-gradient': routeSpeedGradient } : {}),
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
          id: 'kilometre-split-hit-area',
          type: 'circle',
          source: 'kilometre-splits',
          layout: {
            'circle-sort-key': ['get', 'sortKey'],
          },
          paint: {
            'circle-color': colors.primary,
            'circle-opacity': 0.01,
            'circle-radius': 14,
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
            'circle-color': colors.primary,
            'circle-emissive-strength': 1,
            'circle-radius': 5.5,
            'circle-stroke-color': colors.primary,
            'circle-stroke-width': 1,
          },
        });

        mapboxMap.on('click', 'kilometre-split-hit-area', (event) => {
          const feature = event.features?.find(({ properties }) => properties?.label !== undefined);
          const kilometreNumber = Number(feature?.properties?.label);
          if (!feature || !Number.isFinite(kilometreNumber)) return;

          kilometrePopupRef.current?.remove();
          const popup = new MapboxPopup({ closeButton: false, closeOnClick: false, maxWidth: 'none', offset: 8 })
            .setLngLat(event.lngLat)
            .setText(`${kilometreNumber} ${kilometreUnit}`)
            .addTo(mapboxMap);
          kilometrePopupRef.current = popup;
          styleKilometrePopup(popup, colors.surface, colors.onSurface, colors.outlineVariant);
        });

        mapboxMap.on('click', (event) => {
          const tappedKilometre = mapboxMap.queryRenderedFeatures(event.point, {
            layers: ['kilometre-split-hit-area'],
          });
          if (tappedKilometre.length) return;

          kilometrePopupRef.current?.remove();
          kilometrePopupRef.current = null;
        });
      }

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
      mapResizeObserver?.disconnect();
      if (playbackCameraUpdateRef?.current === updatePlaybackCamera) {
        playbackCameraUpdateRef.current = null;
      }
      if (mapControlsRef?.current === mapControls) mapControlsRef.current = null;
      kilometrePopupRef.current?.remove();
      kilometrePopupRef.current = null;
      playbackMarkerRef.current?.remove();
      playbackMarkerRef.current = null;
      playbackMarkerElementRef.current = null;
      mapboxMap.remove();
      mapRef.current = null;
    };
  }, [
    boundBox,
    colors.onSurface,
    colors.outlineVariant,
    colors.primary,
    colors.surface,
    dark,
    mapStyleURL,
    cameraPitch,
    cameraZoomLevel,
    enable3DTerrain,
    followPlaybackCamera,
    kilometreSplitFeatures,
    kilometreUnit,
    mapControlsRef,
    playbackCameraUpdateRef,
    routeBaseFeatures,
    routeCoordinates,
    routeFeatures,
    routeSpeedGradient,
    safeAreaBottomInset,
    showPlaybackMarker,
  ]);

  useEffect(() => {
    brandingBottomInsetRef.current = safeAreaBottomInset;
    const map = mapRef.current;
    if (map) updateMapboxBrandingPosition(map, safeAreaBottomInset);
  }, [safeAreaBottomInset]);

  useEffect(() => {
    if (!playbackCoordinate) return;
    if (showPlaybackMarker) playbackMarkerRef.current?.setLngLat(playbackCoordinate);
  }, [playbackCoordinate, showPlaybackMarker]);

  return <div ref={mapNode} style={{ flex: 1, width: '100%', minHeight: 0 }} />;
}
