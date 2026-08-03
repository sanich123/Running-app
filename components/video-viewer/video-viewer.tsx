import { useVideoPlayer, VideoView } from 'expo-video';
import { useWindowDimensions } from 'react-native';

export default function VideoViewer({ url }: { url: string }) {
  const player = useVideoPlayer(url, (player) => player.play());
  const { width, height } = useWindowDimensions();
  return (
    <VideoView
      style={{ width, height }}
      player={player}
      fullscreenOptions={{ enable: true }}
      allowsPictureInPicture
      nativeControls
    />
  );
}
