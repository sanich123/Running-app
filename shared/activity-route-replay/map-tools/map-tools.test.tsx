import { screen, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { renderWithProviders } from '@T/utils/test-utils';
import MapTools from './map-tools';

describe('route replay map tools', () => {
  it('shows vertical playback speed buttons and changes the selected speed', async () => {
    const onSetPlaybackSpeed = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}>
        <MapTools
          mapStyle="satellite"
          playbackSpeed={1}
          playbackDuration={60_000}
          copy={{
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
          }}
          onZoomIn={jest.fn()}
          onZoomOut={jest.fn()}
          onMapStyleChange={jest.fn()}
          onSetPlaybackSpeed={onSetPlaybackSpeed}
          onSetPlaybackDuration={jest.fn()}
          canZoomIn
          canZoomOut
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByTestId('activity-route-replay-map-speed-buttons').props.style[0].flexDirection).toBe('column');
    expect(screen.getByTestId('activity-route-replay-speed-0-25')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-route-replay-speed-2')).toBeOnTheScreen();

    await user.press(screen.getByTestId('activity-route-replay-speed-0-5'));

    expect(onSetPlaybackSpeed).toHaveBeenCalledWith(0.5);
  });
});
