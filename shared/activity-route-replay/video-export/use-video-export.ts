import { useCallback, useRef, useState } from 'react';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PixelRatio } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import {
  ACTIVITY_ROUTE_REPLAY_EXPORT_COVER_DURATION_MS,
  ACTIVITY_ROUTE_REPLAY_EXPORT_FPS,
  ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_BITRATE,
  ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_SIZE_BYTES,
  ACTIVITY_ROUTE_REPLAY_MAX_DURATION_MS,
} from '../const';
import useReplayVideoRecorder from './recording-view/use-replay-video-recorder';
import {
  formatReplayVideoSize,
  getReplayVideoFilename,
  getReplayVideoPath,
  getReplayVideoSize,
  getReplayVideoUri,
} from './utils';
import type { ReplayVideoExportOptions, ReplayVideoExportState } from './types';

function waitForExportPaint(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    let isSettled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (isSettled) return;
      isSettled = true;
      if (timeout !== undefined) clearTimeout(timeout);
      signal.removeEventListener('abort', finish);
      resolve();
    };

    signal.addEventListener('abort', finish, { once: true });
    requestAnimationFrame(() => {
      if (isSettled) return;
      requestAnimationFrame(() => {
        if (isSettled) return;
        timeout = setTimeout(finish, 200);
      });
    });
    if (signal.aborted) finish();
  });
}

export default function useVideoExport({
  playback,
  copy,
  workoutDate,
}: ReplayVideoExportOptions): ReplayVideoExportState {
  const recorder = useReplayVideoRecorder();
  const isExportingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCoverReadyRef = useRef(false);
  const onCoverReadyRef = useRef<(() => void) | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCoverFrame, setIsCoverFrame] = useState(false);
  const [readyVideo, setReadyVideo] = useState<{ uri: string; size: string } | null>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const readyVideoRef = useRef<typeof readyVideo>(null);

  const onLayout = useCallback(({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    setMapSize((previous) =>
      previous.width === layout.width && previous.height === layout.height
        ? previous
        : { width: layout.width, height: layout.height },
    );
  }, []);

  const onCoverReady = useCallback(() => {
    if (isCoverReadyRef.current) return;
    isCoverReadyRef.current = true;
    onCoverReadyRef.current?.();
  }, []);

  const waitForCoverReady = useCallback((signal: AbortSignal) => {
    if (isCoverReadyRef.current || signal.aborted) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const finish = () => {
        clearTimeout(timeout);
        signal.removeEventListener('abort', finish);
        onCoverReadyRef.current = null;
        resolve();
      };
      const timeout = setTimeout(finish, 1500);
      onCoverReadyRef.current = finish;
      signal.addEventListener('abort', finish, { once: true });
      if (signal.aborted) finish();
    });
  }, []);

  const cancelVideoExport = useCallback(() => {
    if (!isExportingRef.current) return;
    abortControllerRef.current?.abort();
  }, []);

  const dismissReadyVideo = useCallback(() => {
    readyVideoRef.current = null;
    setReadyVideo(null);
  }, []);

  const shareReadyVideo = useCallback(async () => {
    const video = readyVideoRef.current;
    if (!video) return;

    readyVideoRef.current = null;
    setReadyVideo(null);
    try {
      await Sharing.shareAsync(video.uri, {
        mimeType: 'video/mp4',
        UTI: 'public.mpeg-4',
        dialogTitle: copy.shareVideo,
      });
    } catch (error) {
      errorToast('', error);
    }
  }, [copy.shareVideo]);

  const shareVideo = useCallback(async () => {
    if (isExportingRef.current || mapSize.width <= 0 || mapSize.height <= 0) return;

    isExportingRef.current = true;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    isCoverReadyRef.current = false;
    onCoverReadyRef.current = null;
    setIsExporting(true);
    setIsCoverFrame(false);
    readyVideoRef.current = null;
    setReadyVideo(null);
    const previousProgress = playback.progress;
    const wasStarted = playback.hasStarted;
    const wasPlaying = playback.isPlaying;
    let shouldRestorePlayback = false;
    let keepPlaybackPaused = false;

    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (abortController.signal.aborted) return;
      if (!isSharingAvailable) {
        errorToast(copy.shareUnavailable);
        return;
      }

      const outputSize = getReplayVideoSize(mapSize.width, mapSize.height, PixelRatio.get());
      const boundedVideoDuration = Math.min(playback.playbackDuration, ACTIVITY_ROUTE_REPLAY_MAX_DURATION_MS);
      const routeFrameCount = Math.ceil((boundedVideoDuration * ACTIVITY_ROUTE_REPLAY_EXPORT_FPS) / 1000);
      const coverFrameCount = Math.ceil(
        (ACTIVITY_ROUTE_REPLAY_EXPORT_COVER_DURATION_MS * ACTIVITY_ROUTE_REPLAY_EXPORT_FPS) / 1000,
      );
      const totalFrames = routeFrameCount + coverFrameCount;
      const outputDurationSeconds = totalFrames / ACTIVITY_ROUTE_REPLAY_EXPORT_FPS;
      const bitrate = Math.min(
        ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_BITRATE,
        Math.floor((ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_SIZE_BYTES * 8) / outputDurationSeconds),
      );
      const output = getReplayVideoPath(new File(Paths.cache, getReplayVideoFilename(workoutDate)).uri);

      playback.prepareVideoRecording();
      setIsCoverFrame(true);
      shouldRestorePlayback = true;
      await waitForCoverReady(abortController.signal);
      if (abortController.signal.aborted) return;
      await waitForExportPaint(abortController.signal);
      if (abortController.signal.aborted) return;

      const videoPath = await recorder.record({
        output,
        fps: ACTIVITY_ROUTE_REPLAY_EXPORT_FPS,
        totalFrames,
        width: outputSize.width,
        height: outputSize.height,
        codec: 'h264',
        bitrate,
        optimizeForNetwork: true,
        signal: abortController.signal,
        onFrame: ({ frameIndex }) => {
          const isCover = frameIndex < coverFrameCount;
          setIsCoverFrame(isCover);
          const routeFrameIndex = frameIndex - coverFrameCount;
          const frameProgress =
            isCover || routeFrameIndex < 0
              ? 0
              : routeFrameIndex >= routeFrameCount - 1
                ? 1
                : routeFrameIndex / (routeFrameCount - 1);
          playback.setVideoFrameProgress(frameProgress, 1000 / ACTIVITY_ROUTE_REPLAY_EXPORT_FPS);
        },
      });
      if (abortController.signal.aborted) {
        new File(videoPath).delete();
        return;
      }
      keepPlaybackPaused = true;

      const videoUri = getReplayVideoUri(videoPath);
      const videoSize = new File(videoUri).size;
      const nextReadyVideo = { uri: videoUri, size: formatReplayVideoSize(videoSize) };
      readyVideoRef.current = nextReadyVideo;
      setReadyVideo(nextReadyVideo);
    } catch (error) {
      if (!abortController.signal.aborted) errorToast('', error);
    } finally {
      if (shouldRestorePlayback) {
        playback.restoreAfterVideoRecording(previousProgress, wasStarted, wasPlaying && !keepPlaybackPaused);
      }
      isExportingRef.current = false;
      abortControllerRef.current = null;
      isCoverReadyRef.current = false;
      onCoverReadyRef.current = null;
      setIsCoverFrame(false);
      setIsExporting(false);
    }
  }, [copy, mapSize.height, mapSize.width, playback, recorder, waitForCoverReady, workoutDate]);

  return {
    isExporting,
    isCoverFrame,
    readyVideo,
    onCoverReady,
    cancelVideoExport,
    dismissReadyVideo,
    shareReadyVideo,
    recorder,
    onLayout,
    shareVideo,
  };
}
