import { screen } from '@testing-library/react-native';
import * as ExpoVideo from 'expo-video';
import { renderWithProviders } from '@T/utils/test-utils';
import VideoMedia, { formatVideoDuration } from './video-media';

jest.mock('expo-video', () => {
  const { View } = jest.requireActual('react-native');
  return { VideoView: View, useVideoPlayer: jest.fn() };
});

const mockUseVideoPlayer = ExpoVideo.useVideoPlayer as jest.Mock;

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
  });

  it('formats empty, minute, and hour-long durations', () => {
    expect(formatVideoDuration(Number.NaN)).toBe('');
    expect(formatVideoDuration(0)).toBe('');
    expect(formatVideoDuration(13)).toBe('0:13');
    expect(formatVideoDuration(3661)).toBe('1:01:01');
  });

  it('pauses inactive videos and hides the duration until metadata is available', async () => {
    const player = makePlayer();
    mockUseVideoPlayer.mockReturnValue(player);

    await renderWithProviders(
      <VideoMedia
        url="https://images.example.test/inactive.mp4"
        width={320}
        height={220}
        isActive={false}
        muteLabel="Mute video"
        unmuteLabel="Unmute video"
        testID="inactive-video"
      />,
    );

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.play).not.toHaveBeenCalled();
    expect(screen.queryByText('0:00')).not.toBeOnTheScreen();
  });

  it('renders duration without requiring a metadata callback or video dimensions', async () => {
    const player = makePlayer({ duration: 61.4 });
    mockUseVideoPlayer.mockReturnValue(player);

    await renderWithProviders(
      <VideoMedia
        url="https://images.example.test/metadata-only.mp4"
        width={320}
        height={220}
        isActive
        muteLabel="Mute video"
        unmuteLabel="Unmute video"
        testID="metadata-only-video"
      />,
    );

    expect(screen.getByText('1:01')).toBeOnTheScreen();
    expect(player.play).toHaveBeenCalledTimes(1);
  });
});
