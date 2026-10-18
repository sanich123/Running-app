import { act, render, screen } from '@testing-library/react-native';
import { useVideoPlayer } from 'expo-video';
import { renderWithProviders } from '@T/utils/test-utils';
import ActiveVideoPlayer from './active-video-player';

jest.mock('expo-video', () => {
  const { View } = jest.requireActual('react-native');
  return { VideoView: View, useVideoPlayer: jest.fn() };
});

const mockUseVideoPlayer = useVideoPlayer as jest.Mock;
const mockListeners = new Map<string, () => void>();
const mockSourceSubscription = { remove: jest.fn() };
const mockTrackSubscription = { remove: jest.fn() };
const mockPlayer = {
  addListener: jest.fn((event: string, listener: () => void) => {
    mockListeners.set(event, listener);
    return event === 'sourceLoad' ? mockSourceSubscription : mockTrackSubscription;
  }),
  duration: 12.5,
  loop: false,
  muted: true,
  pause: jest.fn(),
  play: jest.fn(),
  videoTrack: { size: { width: 1920, height: 1080 } },
};

describe('ActiveVideoPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListeners.clear();
    mockUseVideoPlayer.mockImplementation((_url: string, setup: (player: typeof mockPlayer) => void) => {
      setup(mockPlayer);
      return mockPlayer;
    });
  });

  it('plays with the requested mute state and reports loaded video metadata', async () => {
    const onMetadata = jest.fn();
    await renderWithProviders(
      <ActiveVideoPlayer
        url="https://cdn.example.test/activity.mp4"
        isMuted={false}
        isPaused={false}
        onMetadata={onMetadata}
      />,
    );

    expect(mockPlayer.loop).toBe(true);
    expect(mockPlayer.muted).toBe(false);
    expect(mockPlayer.play).toHaveBeenCalled();
    expect(screen.getByTestId('active-video-player')).toBeOnTheScreen();

    await act(async () => mockListeners.get('sourceLoad')?.());
    expect(onMetadata).toHaveBeenCalledWith({ duration: 12.5, aspectRatio: 1920 / 1080 });
  });

  it('pauses playback and removes media listeners when unmounted', async () => {
    mockUseVideoPlayer.mockImplementation((_url: string, setup: (player: typeof mockPlayer) => void) => {
      setup(mockPlayer);
      return mockPlayer;
    });
    const rendered = await render(
      <ActiveVideoPlayer url="https://cdn.example.test/activity.mp4" isMuted isPaused onMetadata={jest.fn()} />,
    );

    expect(mockPlayer.pause).toHaveBeenCalled();
    await rendered.unmount();

    expect(mockPlayer.pause).toHaveBeenCalled();
    expect(mockSourceSubscription.remove).toHaveBeenCalledTimes(1);
    expect(mockTrackSubscription.remove).toHaveBeenCalledTimes(1);
  });
});
