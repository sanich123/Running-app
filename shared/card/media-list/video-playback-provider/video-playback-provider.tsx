import { useState, type PropsWithChildren } from 'react';
import { VideoPlaybackContext } from '../video-playback-context';

export default function VideoPlaybackProvider({ children }: PropsWithChildren) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <VideoPlaybackContext.Provider value={{ activeVideoId, setActiveVideoId }}>
      {children}
    </VideoPlaybackContext.Provider>
  );
}
