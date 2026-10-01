import { useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useWindowDimensions } from 'react-native';

export default function VideoViewer({ url, isActive = true }: { url: string; isActive?: boolean }) {
  const player = useVideoPlayer(url);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

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
