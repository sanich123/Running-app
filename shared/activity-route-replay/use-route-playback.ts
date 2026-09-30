import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ACTIVITY_ROUTE_REPLAY_DEFAULT_DURATION_MS,
  ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_ANIMATION_MS,
  ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_INTERVAL_MS,
  ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_SETTLE_MS,
} from './const';
import {
  getRouteCoordinateAtPlaybackProgress,
  getRouteHeadingAtProgress,
  getRouteSpeedAtPlaybackProgress,
  smoothRouteHeading,
} from './utils';
import type { ReplayDuration, ReplayMapRef, RouteTimeline } from './types';

export default function useRoutePlayback(timeline: RouteTimeline, activityMapRef: ReplayMapRef) {
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackDuration, setPlaybackDuration] = useState<ReplayDuration>(ACTIVITY_ROUTE_REPLAY_DEFAULT_DURATION_MS);
  const progressRef = useRef(0);
  const smoothedCameraHeadingRef = useRef<number | null>(null);
  const lastCameraFrameAtRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const lastSeekCameraUpdateAtRef = useRef(0);
  const playbackCoordinate = useMemo(
    () => getRouteCoordinateAtPlaybackProgress(timeline, progress),
    [progress, timeline],
  );
  const playbackHeading = useMemo(() => getRouteHeadingAtProgress(timeline, progress), [progress, timeline]);
  const currentSpeed = useMemo(() => getRouteSpeedAtPlaybackProgress(timeline, progress), [progress, timeline]);

  const updateCamera = useCallback(
    (coordinate: [number, number], heading: number, zoomLevel?: number, animationDurationMs?: number) => {
      activityMapRef.current?.updateCamera(coordinate, heading, zoomLevel, animationDurationMs);
    },
    [activityMapRef],
  );

  useEffect(() => {
    if (!isPlaying || timeline.coordinates.length < 2) return undefined;

    let animationFrame = 0;
    let lastProgressUpdateAt = 0;
    let lastFrameAt: number | null = null;

    const updatePlaybackFrame = (timestamp: number) => {
      const elapsedSinceLastFrame = lastFrameAt === null ? 0 : timestamp - lastFrameAt;
      lastFrameAt = timestamp;
      const nextProgress = Math.min(progressRef.current + elapsedSinceLastFrame / playbackDuration, 1);
      progressRef.current = nextProgress;

      const coordinate = getRouteCoordinateAtPlaybackProgress(timeline, nextProgress);
      if (coordinate) {
        const targetHeading = getRouteHeadingAtProgress(timeline, nextProgress);
        const elapsedMs = lastCameraFrameAtRef.current === null ? 0 : timestamp - lastCameraFrameAtRef.current;
        const heading =
          smoothedCameraHeadingRef.current === null
            ? targetHeading
            : smoothRouteHeading(smoothedCameraHeadingRef.current, targetHeading, elapsedMs);
        smoothedCameraHeadingRef.current = heading;
        updateCamera(coordinate, heading);
      }
      lastCameraFrameAtRef.current = timestamp;

      if (timestamp - lastProgressUpdateAt >= 33 || nextProgress >= 1) {
        lastProgressUpdateAt = timestamp;
        setProgress(nextProgress);
      }
      if (nextProgress >= 1) {
        setIsPlaying(false);
        return;
      }
      animationFrame = requestAnimationFrame(updatePlaybackFrame);
    };

    animationFrame = requestAnimationFrame(updatePlaybackFrame);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, playbackDuration, timeline, updateCamera]);

  const togglePlayback = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setIsPlaying(true);
      return;
    }
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setProgress(0);
      setIsPlaying(true);
      return;
    }
    if (isPlaying) setProgress(progressRef.current);
    setIsPlaying((previous) => !previous);
  };

  const startSeeking = () => {
    isSeekingRef.current = true;
    lastSeekCameraUpdateAtRef.current = 0;
    setIsPlaying(false);
  };

  const seekToProgress = (requestedProgress: number) => {
    const nextProgress = Math.max(0, Math.min(1, requestedProgress));
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    setIsPlaying(false);

    const coordinate = getRouteCoordinateAtPlaybackProgress(timeline, nextProgress);
    if (!coordinate) return;

    const targetHeading = getRouteHeadingAtProgress(timeline, nextProgress);
    const now = performance.now();

    if (isSeekingRef.current) {
      if (now - lastSeekCameraUpdateAtRef.current >= ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_INTERVAL_MS) {
        const elapsedMs = lastCameraFrameAtRef.current === null ? 0 : now - lastCameraFrameAtRef.current;
        const heading =
          smoothedCameraHeadingRef.current === null
            ? targetHeading
            : smoothRouteHeading(smoothedCameraHeadingRef.current, targetHeading, elapsedMs);
        smoothedCameraHeadingRef.current = heading;
        lastCameraFrameAtRef.current = now;
        lastSeekCameraUpdateAtRef.current = now;
        updateCamera(coordinate, heading, undefined, ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_ANIMATION_MS);
      }
    } else {
      smoothedCameraHeadingRef.current = targetHeading;
      lastCameraFrameAtRef.current = now;
      updateCamera(coordinate, targetHeading, undefined, ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_ANIMATION_MS);
    }
  };

  const finishSeeking = () => {
    isSeekingRef.current = false;
    const coordinate = getRouteCoordinateAtPlaybackProgress(timeline, progressRef.current);
    if (!coordinate) return;

    const heading = getRouteHeadingAtProgress(timeline, progressRef.current);
    const now = performance.now();
    smoothedCameraHeadingRef.current = heading;
    lastCameraFrameAtRef.current = now;
    updateCamera(coordinate, heading, undefined, ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_SETTLE_MS);
  };

  const prepareVideoRecording = () => {
    isSeekingRef.current = false;
    smoothedCameraHeadingRef.current = null;
    lastCameraFrameAtRef.current = null;
    progressRef.current = 0;
    setProgress(0);
    setHasStarted(true);
    setIsPlaying(false);

    const coordinate = getRouteCoordinateAtPlaybackProgress(timeline, 0);
    if (coordinate) {
      const heading = getRouteHeadingAtProgress(timeline, 0);
      smoothedCameraHeadingRef.current = heading;
      updateCamera(coordinate, heading);
    }
  };

  const setVideoFrameProgress = (requestedProgress: number, frameDurationMs: number) => {
    const nextProgress = Math.max(0, Math.min(1, requestedProgress));
    progressRef.current = nextProgress;
    setProgress(nextProgress);

    const coordinate = getRouteCoordinateAtPlaybackProgress(timeline, nextProgress);
    if (!coordinate) return;

    const targetHeading = getRouteHeadingAtProgress(timeline, nextProgress);
    const heading =
      smoothedCameraHeadingRef.current === null
        ? targetHeading
        : smoothRouteHeading(smoothedCameraHeadingRef.current, targetHeading, frameDurationMs);
    smoothedCameraHeadingRef.current = heading;
    updateCamera(coordinate, heading);
  };

  const restoreAfterVideoRecording = (previousProgress: number, wasStarted: boolean, wasPlaying: boolean) => {
    const restoredProgress = Math.max(0, Math.min(1, previousProgress));
    progressRef.current = restoredProgress;
    setProgress(restoredProgress);
    setHasStarted(wasStarted);
    setIsPlaying(wasPlaying);
    isSeekingRef.current = false;

    const coordinate = getRouteCoordinateAtPlaybackProgress(timeline, restoredProgress);
    if (!coordinate) return;

    const heading = getRouteHeadingAtProgress(timeline, restoredProgress);
    smoothedCameraHeadingRef.current = heading;
    lastCameraFrameAtRef.current = performance.now();
    updateCamera(coordinate, heading, undefined, ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_SETTLE_MS);
  };

  return {
    progress,
    hasStarted,
    isPlaying,
    playbackDuration,
    playbackCoordinate,
    playbackHeading,
    currentSpeed,
    togglePlayback,
    startSeeking,
    seekToProgress,
    finishSeeking,
    setPlaybackDuration,
    prepareVideoRecording,
    setVideoFrameProgress,
    restoreAfterVideoRecording,
  };
}
