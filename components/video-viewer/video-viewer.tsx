import { Video, ResizeMode } from 'expo-av';
import { useRef } from 'react';

export default function VideoViewer({ url, thumbnail }: { url: string; thumbnail?: string | null }) {
  const video = useRef<Video>(null);
  return (
    <Video
      ref={video}
      style={{ flex: 1 }}
      source={{ uri: url }}
      useNativeControls
      usePoster
      posterSource={{ uri: thumbnail || undefined }}
      resizeMode={ResizeMode.CONTAIN}
      isLooping
    />
  );
}
