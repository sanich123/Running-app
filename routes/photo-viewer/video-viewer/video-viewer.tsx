import { useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useWindowDimensions } from 'react-native';
import { useIsFocused } from 'expo-router';
import type { VideoViewerProps } from './types';

export default function VideoViewer({ url, isActive = true }: VideoViewerProps) {
  const player = useVideoPlayer(url);
  const isFocused = useIsFocused();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (isActive && isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isFocused, player]);

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
