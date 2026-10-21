import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import * as ExpoVideo from 'expo-video';
import { renderWithProviders } from '@T/utils/test-utils';
import { formatVideoDuration } from '../const';
import VideoMedia from './video-media';
import VideoPlaybackProvider from '../video-playback-provider/video-playback-provider';

jest.mock('expo-video', () => {
  const { View } = jest.requireActual('react-native');
  return { VideoView: View, useVideoPlayer: jest.fn() };
});

const mockUseVideoPlayer = ExpoVideo.useVideoPlayer as jest.Mock;
const mockUseIsFocused = jest.fn(() => true);

jest.mock('expo-router', () => ({ useIsFocused: () => mockUseIsFocused() }));

function makePlayer(overrides: Record<string, unknown> = {}) {
  return {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    duration: 0,
    muted: true,
    pause: jest.fn(),
    play: jest.fn(),
    videoTrack: undefined,
    ...overrides,
  };
}

describe('VideoMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsFocused.mockReturnValue(true);
  });

  it('formats empty, minute, and hour-long durations', () => {
    expect(formatVideoDuration(Number.NaN)).toBe('');
    expect(formatVideoDuration(0)).toBe('');
    expect(formatVideoDuration(13)).toBe('0:13');
    expect(formatVideoDuration(3661)).toBe('1:01:01');
  });

  it('shows the preview without creating a player until playback is requested', async () => {
    const user = userEvent.setup();
    const player = makePlayer();
    mockUseVideoPlayer.mockReturnValue(player);

    await renderWithProviders(
      <VideoPlaybackProvider>
        <VideoMedia
          url="https://images.example.test/inactive.mp4"
          thumbnail={null}
          width={320}
          height={220}
          playLabel="Play video"
          pauseLabel="Pause video"
          muteLabel="Mute video"
          unmuteLabel="Unmute video"
          testID="inactive-video"
        />
      </VideoPlaybackProvider>,
    );

    expect(mockUseVideoPlayer).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
    expect(screen.queryByText('0:00')).not.toBeOnTheScreen();

    await user.press(screen.getByTestId('inactive-video-play'));
    expect(mockUseVideoPlayer).toHaveBeenCalledTimes(1);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('reports the preview aspect ratio when the thumbnail loads with valid dimensions', async () => {
    const onMetadata = jest.fn();

    await renderWithProviders(
      <VideoPlaybackProvider>
        <VideoMedia
          url="https://images.example.test/thumbnail.mp4"
          thumbnail="https://images.example.test/thumbnail.jpg"
          width={320}
          height={220}
          playLabel="Play video"
          pauseLabel="Pause video"
          muteLabel="Mute video"
          unmuteLabel="Unmute video"
          testID="thumbnail-video"
          onMetadata={onMetadata}
        />
      </VideoPlaybackProvider>,
    );

    await fireEvent(screen.getByTestId('thumbnail-video-thumbnail'), 'load', {
      source: { width: 640, height: 360 },
    });

    expect(onMetadata).toHaveBeenCalledWith({ aspectRatio: 640 / 360 });
    expect(mockUseVideoPlayer).not.toHaveBeenCalled();
  });

  it('renders duration without requiring a metadata callback or video dimensions', async () => {
    const player = makePlayer({ duration: 61.4 });
    mockUseVideoPlayer.mockReturnValue(player);

    await renderWithProviders(
      <VideoPlaybackProvider>
        <VideoMedia
          url="https://images.example.test/metadata-only.mp4"
          thumbnail={null}
          width={320}
          height={220}
          playLabel="Play video"
          pauseLabel="Pause video"
          muteLabel="Mute video"
          unmuteLabel="Unmute video"
          testID="metadata-only-video"
        />
      </VideoPlaybackProvider>,
    );

    await userEvent.setup().press(screen.getByTestId('metadata-only-video-play'));
    expect(screen.getByText('1:01')).toBeOnTheScreen();
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('toggles play and pause from the left control without affecting mute', async () => {
    const user = userEvent.setup();
    const player = makePlayer();
    mockUseVideoPlayer.mockReturnValue(player);

    await renderWithProviders(
      <VideoPlaybackProvider>
        <VideoMedia
          url="https://images.example.test/toggle.mp4"
          thumbnail={null}
          width={320}
          height={220}
          playLabel="Play video"
          pauseLabel="Pause video"
          muteLabel="Mute video"
          unmuteLabel="Unmute video"
          testID="toggle-video"
        />
      </VideoPlaybackProvider>,
    );

    const playButton = screen.getByTestId('toggle-video-play');
    await user.press(playButton);
    expect(playButton).toHaveProp('accessibilityLabel', 'Pause video');

    await user.press(playButton);
    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(playButton).toHaveProp('accessibilityLabel', 'Play video');

    await user.press(playButton);
    expect(player.play).toHaveBeenCalledTimes(2);
    expect(playButton).toHaveProp('accessibilityLabel', 'Pause video');
  });

  it('pauses the player when the route loses focus', async () => {
    const player = makePlayer();
    mockUseVideoPlayer.mockReturnValue(player);
    const video = await renderWithProviders(
      <VideoPlaybackProvider>
        <VideoMedia
          url="https://images.example.test/focus.mp4"
          thumbnail={null}
          width={320}
          height={220}
          playLabel="Play video"
          pauseLabel="Pause video"
          muteLabel="Mute video"
          unmuteLabel="Unmute video"
          testID="focus-video"
        />
      </VideoPlaybackProvider>,
    );

    await userEvent.setup().press(screen.getByTestId('focus-video-play'));
    expect(player.play).toHaveBeenCalledTimes(1);

    mockUseIsFocused.mockReturnValue(false);
    await video.rerender(
      <VideoPlaybackProvider>
        <VideoMedia
          url="https://images.example.test/focus.mp4"
          thumbnail={null}
          width={320}
          height={220}
          playLabel="Play video"
          pauseLabel="Pause video"
          muteLabel="Mute video"
          unmuteLabel="Unmute video"
          testID="focus-video"
        />
      </VideoPlaybackProvider>,
    );

    expect(player.pause).toHaveBeenCalled();
    expect(screen.getByTestId('focus-video-play')).toHaveProp('accessibilityLabel', 'Play video');
  });
});
