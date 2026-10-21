import type { ReactNode } from 'react';
import type { ACTIVITY_ROUTE_REPLAY_DURATIONS_MS, ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from './const';
import type { ActivityLocation, ProfileType } from '@S/card/types';

export type RouteCoordinate = [number, number];

export interface RouteTimeline {
  coordinates: RouteCoordinate[];
  cumulativeDistances: number[];
  totalDistance: number;
  cumulativePlaybackTimes: number[];
  totalPlaybackTime: number;
  segmentSpeeds: (number | null)[];
  segmentColors: string[];
}

export interface ActivityRouteReplayProps {
  locations: ActivityLocation[];
  profile?: ProfileType;
  sport?: string;
  workoutDate?: string;
  workoutDuration?: number;
  onVideoExportStateChange?: (isExporting: boolean) => void;
}

export interface ReplayCopy {
  play: string;
  pause: string;
  resume: string;
  replay: string;
  position: string;
  zoomIn: string;
  zoomOut: string;
  duration: string;
  durationSecondsUnit?: string;
  durationMinutesUnit?: string;
  videoExportHint?: string;
  paceUnit?: string;
  playbackTime: string;
  workoutTime: string;
  currentSpeed: string;
  shareVideo: string;
  shareUnavailable: string;
  exportProgress: string;
  exportStayOnPage?: string;
  videoReady: string;
  videoSize: string;
  cancel: string;
  share: string;
  kmh: string;
  satellite: string;
  map: string;
}

export type ReplayDuration = (typeof ACTIVITY_ROUTE_REPLAY_DURATIONS_MS)[number];
export type ReplayMapStyle = keyof typeof ACTIVITY_ROUTE_REPLAY_MAP_STYLES;

export interface ControlsProps {
  progress: number;
  hasStarted: boolean;
  isPlaying: boolean;
  bottomInset?: number;
  playbackTime: number;
  playbackDuration: number;
  workoutTime: number;
  currentSpeed: number | null;
  isDisabled?: boolean;
  isVideoExportAvailable?: boolean;
  isExporting?: boolean;
  copy: ReplayCopy;
  onTogglePlayback: () => void;
  onShareVideo?: () => void;
  onSeekStart: () => void;
  onSeek: (progress: number) => void;
  onSeekEnd: () => void;
  onControlsLayout?: (height: number) => void;
}

export interface MapToolsProps {
  mapStyle: ReplayMapStyle;
  playbackDuration: ReplayDuration;
  copy: ReplayCopy;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMapStyleChange: (mapStyle: ReplayMapStyle) => void;
  onSetPlaybackDuration: (duration: ReplayDuration) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  bottomOffset?: number;
  isDisabled?: boolean;
}

export interface ReplayMapHandle {
  updateCamera: (
    coordinate: RouteCoordinate,
    heading: number,
    zoomLevel?: number,
    animationDurationMs?: number,
  ) => void;
  setZoomLevel: (zoomLevel: number) => void;
}

export type CameraUpdate = ReplayMapHandle['updateCamera'];

export interface ReplayMapRef {
  current: ReplayMapHandle | null;
}

export interface ReplayMapProps {
  locations: ActivityLocation[];
  boundBox: [number, number, number, number];
  routeCoordinates: RouteCoordinate[];
  routeSegmentColors: string[];
  mapStyle: ReplayMapStyle;
  playbackCoordinate: RouteCoordinate;
  playbackHeading: number;
  profile?: ProfileType;
  recordingSessionId?: string;
  recordingOverlay?: ReactNode;
  showRouteEndpointMarkers?: boolean;
}

export interface EmptyStateProps {
  message: string;
}
