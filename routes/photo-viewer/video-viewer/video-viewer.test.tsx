import { screen, render } from '@testing-library/react-native';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';
const mockPlayer = { play: jest.fn(), pause: jest.fn() };
const mockUseVideoPlayer = jest.fn(() => mockPlayer);
const mockUseIsFocused = jest.fn(() => true);
const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
jest.setMock('expo-video', {
  useVideoPlayer: mockUseVideoPlayer,
  VideoView: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'video-view'),
});
jest.setMock('expo-router', { useIsFocused: () => mockUseIsFocused() });
// Load the component after the explicit mock is registered.
const VideoViewer = require('./video-viewer').default;

describe('video viewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsFocused.mockReturnValue(true);
  });

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

  it('pauses when the route loses focus', async () => {
    const video = await render(<VideoViewer url="https://cdn.example.com/activity.mp4" />);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);

    mockUseIsFocused.mockReturnValue(false);
    await video.rerender(<VideoViewer url="https://cdn.example.com/activity.mp4" />);

    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  });
});
