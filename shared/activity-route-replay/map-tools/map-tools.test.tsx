import { screen, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { renderWithProviders } from '@T/utils/test-utils';
import MapTools from './map-tools';

describe('route replay map tools', () => {
  it('uses the same replay duration up to five minutes for playback and video', async () => {
    const onSetPlaybackDuration = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}>
        <MapTools
          mapStyle="satellite"
          playbackDuration={60_000}
          copy={{
            play: 'Play',
            pause: 'Pause',
            resume: 'Resume',
            replay: 'Replay',
            position: 'Route position',
            zoomIn: 'Zoom in',
            zoomOut: 'Zoom out',
            duration: 'Replay and video length',
            durationSecondsUnit: 's',
            durationMinutesUnit: 'm',
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
          onSetPlaybackDuration={onSetPlaybackDuration}
          canZoomIn
          canZoomOut
        />
      </SafeAreaProvider>,
    );

    const durationSelector = screen.getByTestId('activity-route-replay-duration-selector');
    expect(screen.getByText('1m')).toBeOnTheScreen();
    await user.press(durationSelector);

    const selectedDuration = screen.getByTestId('activity-route-replay-duration-60000');
    expect(selectedDuration.props.accessibilityState).toMatchObject({ selected: true });
    await user.press(screen.getByTestId('activity-route-replay-duration-300000'));
    expect(onSetPlaybackDuration).toHaveBeenCalledWith(300_000);
  });
});
