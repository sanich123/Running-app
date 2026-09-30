import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { useReplayVideoRecorder } from './recording-view';
import useVideoExport from './use-video-export';
import type { ReplayExportPlayback, ReplayRecordOptions, ReplayVideoRecorder } from './types';

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((path: string | { uri: string }, fileName?: string) => {
    const basePath = typeof path === 'string' ? path : path.uri;
    const uri = fileName ? `${basePath}/${fileName}` : basePath;
    return { uri: uri.startsWith('file://') ? uri : `file://${uri}`, size: 1536 };
  }),
  Paths: { cache: { uri: 'file:///cache' } },
}));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('./recording-view', () => ({ useReplayVideoRecorder: jest.fn() }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

const mockSharing = jest.requireMock('expo-sharing') as {
  isAvailableAsync: jest.Mock;
  shareAsync: jest.Mock;
};
const mockRecorder = useReplayVideoRecorder as jest.MockedFunction<typeof useReplayVideoRecorder>;

const copy = {
  cancel: 'Cancel',
  share: 'Share',
  shareUnavailable: 'Sharing unavailable',
  shareVideo: 'Share workout video',
  videoReady: 'Workout video is ready',
  videoSize: 'File size',
};

function createPlayback(): ReplayExportPlayback {
  return {
    progress: 0.35,
    hasStarted: true,
    isPlaying: true,
    playbackDuration: 30_000,
    prepareVideoRecording: jest.fn(),
    setVideoFrameProgress: jest.fn(),
    restoreAfterVideoRecording: jest.fn(),
  };
}

function layoutEvent(width: number, height: number) {
  return { nativeEvent: { layout: { x: 0, y: 0, width, height } } } as never;
}

async function waitForExportDelay() {
  await jest.advanceTimersByTimeAsync(200);
}

describe('route video export hook', () => {
  const requestAnimationFrameBefore = globalThis.requestAnimationFrame;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSharing.isAvailableAsync.mockResolvedValue(true);
    mockSharing.shareAsync.mockResolvedValue(undefined);
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    globalThis.requestAnimationFrame = requestAnimationFrameBefore;
  });

  it('waits for map layout and reports when device sharing is unavailable', async () => {
    const playback = createPlayback();
    mockSharing.isAvailableAsync.mockResolvedValue(false);
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record: jest.fn() });
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));

    await act(async () => result.current.shareVideo());
    expect(mockSharing.isAvailableAsync).not.toHaveBeenCalled();

    await act(async () => result.current.onLayout(layoutEvent(0, 600)));
    await act(async () => result.current.onLayout(layoutEvent(400, 0)));
    await act(async () => result.current.onLayout(layoutEvent(400, 600)));
    await act(async () => result.current.onLayout(layoutEvent(400, 600)));
    await act(async () => result.current.shareVideo());

    expect(mockSharing.isAvailableAsync).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledWith(copy.shareUnavailable);
    expect(playback.prepareVideoRecording).not.toHaveBeenCalled();
    expect(playback.restoreAfterVideoRecording).not.toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
  });

  it('records the selected replay duration and leaves playback paused', async () => {
    const playback = createPlayback();
    const record = jest.fn(async (options: ReplayRecordOptions) => {
      options.onFrame({ frameIndex: 0, totalFrames: 10 });
      options.onFrame({ frameIndex: 9, totalFrames: 10 });
      return '/cache/workout.mp4';
    });
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    playback.playbackDuration = 90_000;
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.onLayout(layoutEvent(400, 600)));
    await act(async () => {
      const exportPromise = result.current.shareVideo();
      await waitForExportDelay();
      await exportPromise;
    });

    expect(playback.prepareVideoRecording).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        fps: 24,
        totalFrames: 2160,
        codec: 'h264',
        optimizeForNetwork: true,
        bitrate: expect.any(Number),
        output: expect.stringContaining('2026-09-28'),
      }),
    );
    expect(playback.setVideoFrameProgress).toHaveBeenNthCalledWith(1, 0, 1000 / 24);
    expect(playback.setVideoFrameProgress).toHaveBeenNthCalledWith(2, 1, 1000 / 24);
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, false);
    expect(result.current.isExporting).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith(
      copy.videoReady,
      `${copy.videoSize}: 2 KB`,
      expect.arrayContaining([
        expect.objectContaining({ text: copy.cancel }),
        expect.objectContaining({ text: copy.share }),
      ]),
    );

    const shareAction = alertSpy.mock.calls[0]?.[2]?.[1]?.onPress;
    await act(async () => shareAction?.());
    expect(mockSharing.shareAsync).toHaveBeenCalledWith('file:///cache/workout.mp4', {
      mimeType: 'video/mp4',
      UTI: 'public.mpeg-4',
      dialogTitle: copy.shareVideo,
    });
  });

  it('restores the pre-export playback state when recording fails', async () => {
    const playback = createPlayback();
    const error = new Error('recording failed');
    const record = jest.fn().mockRejectedValue(error);
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.onLayout(layoutEvent(500, 300)));
    await act(async () => {
      const exportPromise = result.current.shareVideo();
      await waitForExportDelay();
      await exportPromise;
    });

    expect(errorToast).toHaveBeenCalledWith('', error);
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, true);
    expect(result.current.isExporting).toBe(false);
  });

  it('prevents a second export while device availability is pending', async () => {
    let resolveAvailability: ((available: boolean) => void) | undefined;
    mockSharing.isAvailableAsync.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveAvailability = resolve;
      }),
    );
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record: jest.fn() });
    const { result } = await renderHook(() =>
      useVideoExport({ playback: createPlayback(), copy, workoutDate: '2026-09-28T17:09:23Z' }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.onLayout(layoutEvent(500, 300)));
    let firstExport: Promise<void> | undefined;
    await act(async () => {
      firstExport = result.current.shareVideo();
      await Promise.resolve();
    });
    await act(async () => result.current.shareVideo());
    expect(mockSharing.isAvailableAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveAvailability?.(false);
      await firstExport;
    });
  });
});
