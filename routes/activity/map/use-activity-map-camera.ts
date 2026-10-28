import { useCallback, useEffect, useRef, useState } from 'react';
import { getLocationAnimationDuration } from '@U/location/location-utils';
import type { Camera } from '@rnmapbox/maps';
import type { LocationObject } from 'expo-location';

export default function useActivityMapCamera({
  canRenderMap,
  currentPosition,
}: {
  canRenderMap: boolean;
  currentPosition: LocationObject | null;
}) {
  const cameraRef = useRef<Camera>(null);
  const hasCenteredCameraRef = useRef(false);
  const previousCameraPositionRef = useRef<LocationObject | null>(null);
  const [mapZoomLevel, setMapZoomLevel] = useState(18);
  const [recenteredPosition, setRecenteredPosition] = useState<LocationObject | null>(null);
  const cameraPosition =
    recenteredPosition && (!currentPosition || recenteredPosition.timestamp > currentPosition.timestamp)
      ? recenteredPosition
      : currentPosition;
  const defaultSettings = cameraPosition
    ? {
        centerCoordinate: [cameraPosition.coords.longitude, cameraPosition.coords.latitude] as [number, number],
        zoomLevel: mapZoomLevel,
      }
    : undefined;

  useEffect(() => {
    if (!canRenderMap) {
      hasCenteredCameraRef.current = false;
      previousCameraPositionRef.current = cameraPosition;
      return;
    }
    if (!cameraPosition || !cameraRef.current) return;

    const animationDuration = hasCenteredCameraRef.current
      ? getLocationAnimationDuration(previousCameraPositionRef.current?.timestamp, cameraPosition.timestamp)
      : 0;
    cameraRef.current.setCamera({
      centerCoordinate: [cameraPosition.coords.longitude, cameraPosition.coords.latitude],
      zoomLevel: mapZoomLevel,
      animationMode: hasCenteredCameraRef.current ? 'easeTo' : 'none',
      animationDuration,
    });
    previousCameraPositionRef.current = cameraPosition;
    hasCenteredCameraRef.current = true;
  }, [cameraPosition, canRenderMap, mapZoomLevel]);

  const zoomIn = useCallback(() => {
    setMapZoomLevel((zoomLevel) => Math.min(20, zoomLevel + 1));
  }, []);

  const zoomOut = useCallback(() => {
    setMapZoomLevel((zoomLevel) => Math.max(3, zoomLevel - 1));
  }, []);

  const centerOnPosition = useCallback((position: LocationObject) => {
    setRecenteredPosition(position);
    setMapZoomLevel(18);
  }, []);

  return { cameraRef, cameraPosition, defaultSettings, mapZoomLevel, zoomIn, zoomOut, centerOnPosition };
}
