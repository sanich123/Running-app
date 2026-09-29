import { useState } from 'react';
import {
  ACTIVITY_ROUTE_REPLAY_CAMERA_MAX_ZOOM_LEVEL,
  ACTIVITY_ROUTE_REPLAY_CAMERA_MIN_ZOOM_LEVEL,
  ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL,
  ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_STEP,
} from './const';
import type { ReplayMapRef, ReplayMapStyle } from './types';

export default function useMapControls(activityMapRef: ReplayMapRef) {
  const [zoomLevel, setZoomLevel] = useState(ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL);
  const [mapStyle, setMapStyle] = useState<ReplayMapStyle>('satellite');

  const zoomIn = () => {
    const nextZoomLevel = Math.min(
      zoomLevel + ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_STEP,
      ACTIVITY_ROUTE_REPLAY_CAMERA_MAX_ZOOM_LEVEL,
    );
    setZoomLevel(nextZoomLevel);
    activityMapRef.current?.setZoomLevel(nextZoomLevel);
  };

  const zoomOut = () => {
    const nextZoomLevel = Math.max(
      zoomLevel - ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_STEP,
      ACTIVITY_ROUTE_REPLAY_CAMERA_MIN_ZOOM_LEVEL,
    );
    setZoomLevel(nextZoomLevel);
    activityMapRef.current?.setZoomLevel(nextZoomLevel);
  };

  return {
    zoomLevel,
    mapStyle,
    setMapStyle,
    zoomIn,
    zoomOut,
    canZoomIn: zoomLevel < ACTIVITY_ROUTE_REPLAY_CAMERA_MAX_ZOOM_LEVEL,
    canZoomOut: zoomLevel > ACTIVITY_ROUTE_REPLAY_CAMERA_MIN_ZOOM_LEVEL,
  };
}
