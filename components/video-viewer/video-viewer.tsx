import { Video, ResizeMode } from 'expo-av';
import { useRef } from 'react';

export default function VideoViewer({ url }: { url: string }) {
  const video = useRef<Video>(null);
  return (
    <Video
      ref={video}
      style={{ flex: 1 }}
      source={{ uri: url }}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      isLooping
    />
  );
}
