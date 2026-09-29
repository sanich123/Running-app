import { useCallback, useRef, useState } from 'react';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, PixelRatio } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import {
  ACTIVITY_ROUTE_REPLAY_EXPORT_FPS,
  ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_BITRATE,
  ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_SIZE_BYTES,
} from '../const';
import { useReplayVideoRecorder } from './recording-view';
import {
  formatReplayVideoSize,
  getReplayVideoFilename,
  getReplayVideoPath,
  getReplayVideoSize,
  getReplayVideoUri,
} from './utils';
import type { ReplayVideoExportOptions, ReplayVideoExportState } from './types';

export default function useVideoExport({
  playback,
  copy,
  workoutDate,
}: ReplayVideoExportOptions): ReplayVideoExportState {
  const recorder = useReplayVideoRecorder();
  const isExportingRef = useRef(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const onLayout = useCallback(({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    setMapSize((previous) =>
      previous.width === layout.width && previous.height === layout.height
        ? previous
        : { width: layout.width, height: layout.height },
    );
  }, []);

  const shareVideo = useCallback(async () => {
    if (isExportingRef.current || mapSize.width <= 0 || mapSize.height <= 0) return;

    isExportingRef.current = true;
    setIsExporting(true);
    setProgress(0);
    const previousProgress = playback.progress;
    const wasStarted = playback.hasStarted;
    const wasPlaying = playback.isPlaying;
    let shouldRestorePlayback = false;
    let keepPlaybackPaused = false;

    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        errorToast(copy.shareUnavailable);
        return;
      }

      const outputSize = getReplayVideoSize(mapSize.width, mapSize.height, PixelRatio.get());
      const totalFrames = Math.ceil(
        (playback.playbackDuration * ACTIVITY_ROUTE_REPLAY_EXPORT_FPS) / (1000 * playback.playbackSpeed),
      );
      const outputDurationSeconds = totalFrames / ACTIVITY_ROUTE_REPLAY_EXPORT_FPS;
      const bitrate = Math.min(
        ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_BITRATE,
        Math.floor((ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_SIZE_BYTES * 8) / outputDurationSeconds),
      );
      const output = getReplayVideoPath(new File(Paths.cache, getReplayVideoFilename(workoutDate)).uri);

      playback.prepareVideoRecording();
      shouldRestorePlayback = true;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const videoPath = await recorder.record({
        output,
        fps: ACTIVITY_ROUTE_REPLAY_EXPORT_FPS,
        totalFrames,
        width: outputSize.width,
        height: outputSize.height,
        codec: 'h264',
        bitrate,
        optimizeForNetwork: true,
        onFrame: ({ frameIndex, totalFrames: frameCount }) => {
          const frameProgress = frameIndex >= frameCount - 1 ? 1 : frameIndex / (frameCount - 1);
          const progressPercent = Math.floor(((frameIndex + 1) / frameCount) * 100) / 100;
          setProgress((previous) => (previous === progressPercent ? previous : progressPercent));
          playback.setVideoFrameProgress(
            frameProgress,
            (1000 / ACTIVITY_ROUTE_REPLAY_EXPORT_FPS) * playback.playbackSpeed,
          );
        },
      });
      keepPlaybackPaused = true;

      const videoUri = getReplayVideoUri(videoPath);
      const videoSize = new File(videoUri).size;
      Alert.alert(copy.videoReady, `${copy.videoSize}: ${formatReplayVideoSize(videoSize)}`, [
        { text: copy.cancel, style: 'cancel' },
        {
          text: copy.share,
          onPress: () => {
            void Sharing.shareAsync(videoUri, {
              mimeType: 'video/mp4',
              UTI: 'public.mpeg-4',
              dialogTitle: copy.shareVideo,
            }).catch((error) => errorToast('', error));
          },
        },
      ]);
    } catch (error) {
      errorToast('', error);
    } finally {
      if (shouldRestorePlayback) {
        playback.restoreAfterVideoRecording(previousProgress, wasStarted, wasPlaying && !keepPlaybackPaused);
      }
      isExportingRef.current = false;
      setIsExporting(false);
    }
  }, [copy, mapSize.height, mapSize.width, playback, recorder, workoutDate]);

  return { isExporting, progress, recorder, onLayout, shareVideo };
}
