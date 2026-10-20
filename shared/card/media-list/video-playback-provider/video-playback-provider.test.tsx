import { render, userEvent } from '@testing-library/react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import useVideoPlayback from '../use-video-playback';
import VideoPlaybackProvider from './video-playback-provider';

function PlaybackStateProbe() {
  const { activeVideoId, setActiveVideoId } = useVideoPlayback();

  return (
    <>
      <Text testID="active-video-id">{activeVideoId ?? 'none'}</Text>
      <TouchableRipple testID="activate-video" onPress={() => setActiveVideoId('video-1')}>
        <Text>Activate</Text>
      </TouchableRipple>
    </>
  );
}

describe('VideoPlaybackProvider', () => {
  it('shares the active video id with its descendants', async () => {
    const { getByTestId } = await render(
      <VideoPlaybackProvider>
        <PlaybackStateProbe />
      </VideoPlaybackProvider>,
    );

    expect(getByTestId('active-video-id')).toHaveTextContent('none');
    await userEvent.setup().press(getByTestId('activate-video'));
    expect(getByTestId('active-video-id')).toHaveTextContent('video-1');
  });
});
