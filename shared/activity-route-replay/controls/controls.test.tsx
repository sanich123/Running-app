import { act, screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import Controls from './controls';
import type { ControlsProps } from '../types';

const copy: ControlsProps['copy'] = {
  play: 'Play',
  pause: 'Pause',
  resume: 'Resume',
  replay: 'Replay',
  position: 'Route position',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  duration: 'Replay and video length',
  playbackTime: 'Playback',
  workoutTime: 'Workout',
  currentSpeed: 'Speed',
  shareVideo: 'Share workout video',
  shareUnavailable: 'Sharing unavailable',
  exportProgress: 'Preparing video',
  videoReady: 'Video ready',
  videoSize: 'File size',
  cancel: 'Cancel',
  share: 'Share',
  kmh: 'km/h',
  satellite: 'Satellite',
  map: 'Map',
};

describe('route replay controls', () => {
  it('toggles playback and seeks from the progress bar', async () => {
    const onTogglePlayback = jest.fn();
    const onSeekStart = jest.fn();
    const onSeek = jest.fn();
    const onSeekEnd = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderWithProviders(
      <Controls
        progress={0.25}
        hasStarted
        isPlaying
        playbackTime={15_000}
        playbackDuration={60_000}
        workoutTime={900_000}
        currentSpeed={2.5}
        copy={copy}
        onTogglePlayback={onTogglePlayback}
        onSeekStart={onSeekStart}
        onSeek={onSeek}
        onSeekEnd={onSeekEnd}
      />,
    );

    const toggleButton = screen.getByTestId('activity-route-replay-toggle');
    expect(toggleButton.props.accessibilityLabel).toBe('Pause');
    expect(screen.getByTestId('activity-route-replay-seekbar').props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 25,
    });

    await user.press(toggleButton);
    expect(onTogglePlayback).toHaveBeenCalledTimes(1);

    const seekbar = screen.getByTestId('activity-route-replay-seekbar');
    act(() => {
      seekbar.props.onResponderMove({ nativeEvent: { locationX: 120 } });
    });
    expect(onSeek).not.toHaveBeenCalled();

    act(() => {
      seekbar.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
      seekbar.props.onAccessibilityAction({ nativeEvent: { actionName: 'decrement' } });
      seekbar.props.onAccessibilityAction({ nativeEvent: { actionName: 'unknown' } });
    });
    expect(onSeek).toHaveBeenLastCalledWith(0.25);

    act(() => {
      seekbar.props.onLayout({ nativeEvent: { layout: { width: 200 } } });
      seekbar.props.onResponderGrant({ nativeEvent: { locationX: 120 } });
    });
    expect(onSeekStart).toHaveBeenCalledTimes(1);
    expect(onSeek).toHaveBeenLastCalledWith(0.6);
    act(() => {
      seekbar.props.onResponderRelease({ nativeEvent: { locationX: 160 } });
    });
    expect(onSeekEnd).toHaveBeenCalledTimes(1);
  });
});
