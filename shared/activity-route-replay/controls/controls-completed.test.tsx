import { screen } from '@testing-library/react-native';
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
  speed: 'Playback speed',
  duration: 'Replay duration at 1X',
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

describe('completed route replay controls', () => {
  it('shows replay and share controls when the route has completed', async () => {
    await renderWithProviders(
      <Controls
        progress={1}
        hasStarted
        isPlaying={false}
        playbackTime={60_000}
        playbackDuration={60_000}
        workoutTime={900_000}
        currentSpeed={null}
        isVideoExportAvailable
        copy={copy}
        onTogglePlayback={jest.fn()}
        onSeekStart={jest.fn()}
        onSeek={jest.fn()}
        onSeekEnd={jest.fn()}
      />,
    );

    expect(screen.getByTestId('activity-route-replay-toggle').props.accessibilityLabel).toBe(copy.replay);
    expect(screen.getByTestId('activity-route-replay-share-video').props.accessibilityLabel).toBe(copy.shareVideo);
    expect(screen.getByText('—')).toBeOnTheScreen();
  });
});
