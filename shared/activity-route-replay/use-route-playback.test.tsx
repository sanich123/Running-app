import { act, renderHook, waitFor } from '@testing-library/react-native';
import useRoutePlayback from './use-route-playback';
import { createRouteTimeline } from './utils';
import type { ReplayMapRef } from './types';
import type { ActivityLocation } from '@S/card/types';

const locations = [
  { timestamp: 1_000, coords: { longitude: 37.6, latitude: 55.7, speed: 2 } },
  { timestamp: 2_000, coords: { longitude: 37.61, latitude: 55.71, speed: 3 } },
  { timestamp: 3_000, coords: { longitude: 37.62, latitude: 55.72, speed: 4 } },
] as ActivityLocation[];

describe('route playback hook', () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  let frameCallbacks: FrameRequestCallback[];
  let nowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    frameCallbacks = [];
    nowSpy = jest.spyOn(performance, 'now');
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    nowSpy.mockRestore();
  });

  it('seeks with clamped progress, throttles camera updates during a drag, and settles on release', async () => {
    const updateCamera = jest.fn();
    const mapRef: ReplayMapRef = { current: { updateCamera, setZoomLevel: jest.fn() } };
    const { result } = await renderHook(() => useRoutePlayback(createRouteTimeline(locations), mapRef));
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.seekToProgress(-1));
    expect(result.current.progress).toBe(0);
    expect(updateCamera).toHaveBeenCalledTimes(1);

    await act(async () => result.current.startSeeking());
    nowSpy.mockReturnValueOnce(100).mockReturnValueOnce(120).mockReturnValueOnce(180);
    await act(async () => result.current.seekToProgress(0.25));
    await act(async () => result.current.seekToProgress(0.5));
    await act(async () => result.current.seekToProgress(1.5));
    expect(result.current.progress).toBe(1);
    expect(updateCamera).toHaveBeenCalledTimes(3);
    expect(updateCamera).toHaveBeenLastCalledWith(expect.any(Array), expect.any(Number), undefined, 110);

    nowSpy.mockReturnValue(220);
    await act(async () => result.current.finishSeeking());
    expect(updateCamera).toHaveBeenLastCalledWith(expect.any(Array), expect.any(Number), undefined, 240);
  });

  it('plays frames, stops at the end, and starts over when play is pressed again', async () => {
    const updateCamera = jest.fn();
    const { result } = await renderHook(() =>
      useRoutePlayback(createRouteTimeline(locations), {
        current: { updateCamera, setZoomLevel: jest.fn() },
      }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    };
    globalThis.cancelAnimationFrame = jest.fn();

    await act(async () => {
      result.current.setPlaybackDuration(15_000);
      result.current.togglePlayback();
    });
    expect(result.current.hasStarted).toBe(true);
    expect(result.current.isPlaying).toBe(true);

    await act(async () => frameCallbacks.shift()?.(0));
    await act(async () => frameCallbacks.shift()?.(15_000));
    expect(result.current.progress).toBe(1);
    expect(result.current.isPlaying).toBe(false);
    expect(updateCamera).toHaveBeenCalled();

    await act(async () => result.current.togglePlayback());
    expect(result.current.progress).toBe(0);
    expect(result.current.isPlaying).toBe(true);
  });

  it('pauses a started playback without losing the current route position', async () => {
    const updateCamera = jest.fn();
    const { result } = await renderHook(() =>
      useRoutePlayback(createRouteTimeline(locations), {
        current: { updateCamera, setZoomLevel: jest.fn() },
      }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    globalThis.requestAnimationFrame = jest.fn(() => 1);
    globalThis.cancelAnimationFrame = jest.fn();

    await act(async () => result.current.setVideoFrameProgress(0.25, 33));
    await act(async () => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(true);
    await act(async () => result.current.togglePlayback());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.progress).toBe(0.25);
    await act(async () => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(true);
    await act(async () => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(false);
  });

  it('seeks smoothly from the initial camera state', async () => {
    const updateCamera = jest.fn();
    const mapRef: ReplayMapRef = { current: { updateCamera, setZoomLevel: jest.fn() } };
    const { result } = await renderHook(() => useRoutePlayback(createRouteTimeline(locations), mapRef));
    await waitFor(() => expect(result.current).not.toBeNull());
    nowSpy.mockReturnValue(1_000);

    await act(async () => result.current.startSeeking());
    await act(async () => result.current.seekToProgress(0.5));

    expect(updateCamera).toHaveBeenCalledWith(expect.any(Array), expect.any(Number), undefined, expect.any(Number));
  });

  it('keeps empty routes safe and restores route state after video recording', async () => {
    const emptyMapRef: ReplayMapRef = { current: null };
    const { result } = await renderHook(() => useRoutePlayback(createRouteTimeline([]), emptyMapRef));
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.seekToProgress(0.5));
    expect(result.current.progress).toBe(0.5);
    await act(async () => result.current.finishSeeking());
    await act(async () => result.current.prepareVideoRecording());
    expect(result.current.hasStarted).toBe(true);
    await act(async () => result.current.setVideoFrameProgress(0.4, 40));
    await act(async () => result.current.restoreAfterVideoRecording(2, false, true));
    expect(result.current.progress).toBe(1);
    expect(result.current.hasStarted).toBe(false);
    expect(result.current.isPlaying).toBe(true);
  });

  it('moves the camera through video frames and restores a clamped route position', async () => {
    const updateCamera = jest.fn();
    const mapRef: ReplayMapRef = { current: { updateCamera, setZoomLevel: jest.fn() } };
    const { result } = await renderHook(() => useRoutePlayback(createRouteTimeline(locations), mapRef));
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.prepareVideoRecording());
    expect(updateCamera).toHaveBeenCalledTimes(1);
    await act(async () => result.current.setVideoFrameProgress(0.4, 33));
    await act(async () => result.current.setVideoFrameProgress(0.6, 33));
    expect(result.current.progress).toBe(0.6);
    expect(updateCamera).toHaveBeenCalledTimes(3);

    await act(async () => result.current.restoreAfterVideoRecording(2, true, false));
    expect(result.current.progress).toBe(1);
    expect(result.current.hasStarted).toBe(true);
    expect(result.current.isPlaying).toBe(false);
    expect(updateCamera).toHaveBeenCalledTimes(4);
  });
});
