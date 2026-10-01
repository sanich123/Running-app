import { screen, render } from '@testing-library/react-native';
const mockPlayer = { play: jest.fn(), pause: jest.fn() };
const mockUseVideoPlayer = jest.fn(() => mockPlayer);
const { View } = require('react-native');
jest.setMock('expo-video', {
  useVideoPlayer: mockUseVideoPlayer,
  VideoView: (props: any) => <View testID="video-view" {...props} />,
});
// Load the component after the explicit mock is registered.
const VideoViewer = require('./video-viewer').default;

describe('video viewer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a player for the URL and configures native playback controls', async () => {
    await render(<VideoViewer url="https://cdn.example.com/activity.mp4" />);

    expect(mockUseVideoPlayer).toHaveBeenCalledWith('https://cdn.example.com/activity.mp4');
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('video-view').props.player).toBe(mockPlayer);
    expect(screen.getByTestId('video-view').props.nativeControls).toBe(true);
    expect(screen.getByTestId('video-view').props.fullscreenOptions).toEqual({ enable: true });
  });

  it('pauses while inactive and resumes when active again', async () => {
    const video = await render(<VideoViewer url="https://cdn.example.com/activity.mp4" isActive={false} />);
    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
    expect(mockPlayer.play).not.toHaveBeenCalled();

    await video.rerender(<VideoViewer url="https://cdn.example.com/activity.mp4" isActive />);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });
});
