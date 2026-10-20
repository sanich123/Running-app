import { act, renderHook, waitFor } from '@testing-library/react-native';
import { errorToast } from '@S/error-toast/error-toast';
import useReplayVideoRecorder from './recording-view/use-replay-video-recorder';
import useVideoExport from './use-video-export';
import type { ReplayExportPlayback, ReplayRecordOptions, ReplayVideoRecorder } from './types';

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((path: string | { uri: string }, fileName?: string) => {
    const basePath = typeof path === 'string' ? path : path.uri;
    const uri = fileName ? `${basePath}/${fileName}` : basePath;
    return { uri: uri.startsWith('file://') ? uri : `file://${uri}`, size: 1536, delete: jest.fn() };
  }),
  Paths: { cache: { uri: 'file:///cache' } },
}));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('./recording-view/use-replay-video-recorder', () => ({ __esModule: true, default: jest.fn() }));
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
  await jest.advanceTimersByTimeAsync(2000);
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

    await act(async () => result.current.cancelVideoExport());
    await act(async () => result.current.shareReadyVideo());
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
      options.onFrame({ frameIndex: 0, totalFrames: 2184 });
      options.onFrame({ frameIndex: 23, totalFrames: 2184 });
      options.onFrame({ frameIndex: 24, totalFrames: 2184 });
      options.onFrame({ frameIndex: 2183, totalFrames: 2184 });
      return '/cache/workout.mp4';
    });
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    playback.playbackDuration = 90_000;
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.onLayout(layoutEvent(400, 600)));
    await act(async () => {
      const exportPromise = result.current.shareVideo();
      await Promise.resolve();
      result.current.onCoverReady();
      result.current.onCoverReady();
      await waitForExportDelay();
      await exportPromise;
    });

    expect(playback.prepareVideoRecording).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        fps: 24,
        totalFrames: 2184,
        codec: 'h264',
        optimizeForNetwork: true,
        bitrate: expect.any(Number),
        output: expect.stringContaining('2026-09-28'),
      }),
    );
    expect(playback.setVideoFrameProgress).toHaveBeenNthCalledWith(1, 0, 1000 / 24);
    expect(playback.setVideoFrameProgress).toHaveBeenNthCalledWith(2, 0, 1000 / 24);
    expect(playback.setVideoFrameProgress).toHaveBeenNthCalledWith(3, 0, 1000 / 24);
    expect(playback.setVideoFrameProgress).toHaveBeenNthCalledWith(4, 1, 1000 / 24);
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, false);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.readyVideo).toEqual({ uri: 'file:///cache/workout.mp4', size: '2 KB' });
    await act(async () => result.current.shareReadyVideo());
    expect(result.current.readyVideo).toBeNull();
    expect(mockSharing.shareAsync).toHaveBeenCalledWith('file:///cache/workout.mp4', {
      mimeType: 'video/mp4',
      UTI: 'public.mpeg-4',
      dialogTitle: copy.shareVideo,
    });
    await act(async () => result.current.shareReadyVideo());
    expect(mockSharing.shareAsync).toHaveBeenCalledTimes(1);
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

  it('prevents duplicate exports and cancels while device availability is pending', async () => {
    let resolveAvailability: ((available: boolean) => void) | undefined;
    mockSharing.isAvailableAsync.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveAvailability = resolve;
      }),
    );
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record: jest.fn() });
    const playback = createPlayback();
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.onLayout(layoutEvent(500, 300)));
    let firstExport: Promise<void> | undefined;
    await act(async () => {
      firstExport = result.current.shareVideo();
      await Promise.resolve();
    });
    await act(async () => result.current.shareVideo());
    expect(mockSharing.isAvailableAsync).toHaveBeenCalledTimes(1);
    await act(async () => result.current.cancelVideoExport());

    await act(async () => {
      resolveAvailability?.(true);
      await firstExport;
    });
    expect(playback.prepareVideoRecording).not.toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
  });

  it('cancels while waiting for the cover frame and restores the replay position', async () => {
    const playback = createPlayback();
    const record = jest.fn();
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    await act(async () => result.current.onLayout(layoutEvent(500, 300)));

    let exportPromise: Promise<void> | undefined;
    await act(async () => {
      exportPromise = result.current.shareVideo();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.isCoverFrame).toBe(true);

    await act(async () => {
      result.current.cancelVideoExport();
      await exportPromise;
    });

    expect(record).not.toHaveBeenCalled();
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, true);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.readyVideo).toBeNull();
  });

  it.each(['first', 'second'] as const)('cancels while waiting for the %s export paint frame', async (frame) => {
    const playback = createPlayback();
    const record = jest.fn();
    const queuedFrames: FrameRequestCallback[] = [];
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      queuedFrames.push(callback);
      return queuedFrames.length;
    }) as typeof requestAnimationFrame;
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    await act(async () => result.current.onLayout(layoutEvent(500, 300)));

    let exportPromise: Promise<void> | undefined;
    await act(async () => {
      exportPromise = result.current.shareVideo();
      await Promise.resolve();
      await Promise.resolve();
      result.current.onCoverReady();
      await Promise.resolve();
    });
    expect(queuedFrames).toHaveLength(1);

    if (frame === 'second') {
      await act(async () => queuedFrames.shift()?.(0));
      expect(queuedFrames).toHaveLength(1);
    }

    await act(async () => {
      result.current.cancelVideoExport();
      queuedFrames.shift()?.(0);
      await exportPromise;
    });

    expect(record).not.toHaveBeenCalled();
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, true);
    expect(result.current.isExporting).toBe(false);
  });

  it('settles the paint wait when cancellation happens while registering its frame', async () => {
    const playback = createPlayback();
    const record = jest.fn();
    let cancelExport = () => {};
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      cancelExport();
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame;
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    cancelExport = result.current.cancelVideoExport;
    await act(async () => result.current.onLayout(layoutEvent(500, 300)));

    await act(async () => {
      const exportPromise = result.current.shareVideo();
      await Promise.resolve();
      await Promise.resolve();
      result.current.onCoverReady();
      await exportPromise;
    });

    expect(record).not.toHaveBeenCalled();
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, true);
    expect(result.current.isExporting).toBe(false);
  });

  it('skips waiting for the cover after cancellation during preparation', async () => {
    const playback = createPlayback();
    let cancelExport = () => {};
    playback.prepareVideoRecording = jest.fn(() => cancelExport());
    const record = jest.fn();
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    cancelExport = result.current.cancelVideoExport;
    await act(async () => result.current.onLayout(layoutEvent(500, 300)));

    await act(async () => {
      await result.current.shareVideo();
    });

    expect(record).not.toHaveBeenCalled();
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, true);
    expect(result.current.isExporting).toBe(false);
  });

  it('does not show an error when recording rejects after cancellation', async () => {
    const playback = createPlayback();
    const error = new Error('recording cancelled');
    let cancelExport = () => {};
    const record = jest.fn(() => {
      cancelExport();
      return Promise.reject(error);
    });
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    cancelExport = result.current.cancelVideoExport;
    await act(async () => result.current.onLayout(layoutEvent(500, 300)));

    await act(async () => {
      const exportPromise = result.current.shareVideo();
      await Promise.resolve();
      result.current.onCoverReady();
      await waitForExportDelay();
      await exportPromise;
    });

    expect(record).toHaveBeenCalledTimes(1);
    expect(errorToast).not.toHaveBeenCalled();
    expect(playback.restoreAfterVideoRecording).toHaveBeenCalledWith(0.35, true, true);
  });

  it('deletes a recording that finishes after cancellation', async () => {
    const playback = createPlayback();
    let cancelExport = () => {};
    playback.setVideoFrameProgress = jest.fn(() => cancelExport());
    const record = jest.fn(async (options: ReplayRecordOptions) => {
      options.onFrame({ frameIndex: 30, totalFrames: 100 });
      return '/cache/cancelled.mp4';
    });
    mockRecorder.mockReturnValue({ sessionId: 'recording', isAvailable: true, record } as ReplayVideoRecorder);
    const { result } = await renderHook(() => useVideoExport({ playback, copy, workoutDate: '2026-09-28T17:09:23Z' }));
    cancelExport = result.current.cancelVideoExport;
    await act(async () => result.current.onLayout(layoutEvent(500, 300)));

    await act(async () => {
      const exportPromise = result.current.shareVideo();
      await Promise.resolve();
      result.current.onCoverReady();
      await waitForExportDelay();
      await exportPromise;
    });

    const fileConstructor = jest.requireMock('expo-file-system').File as jest.Mock;
    expect(record).toHaveBeenCalledTimes(1);
    expect(fileConstructor).toHaveBeenLastCalledWith('/cache/cancelled.mp4');
    expect(fileConstructor.mock.results.at(-1)?.value.delete).toHaveBeenCalled();
    expect(result.current.readyVideo).toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });
});
