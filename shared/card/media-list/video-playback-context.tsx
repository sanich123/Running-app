import { createContext, useContext, useState } from 'react';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';

interface VideoPlaybackContextValue {
  activeVideoId: string | null;
  setActiveVideoId: Dispatch<SetStateAction<string | null>>;
}

const VideoPlaybackContext = createContext<VideoPlaybackContextValue>({
  activeVideoId: null,
  setActiveVideoId: () => undefined,
});

export function VideoPlaybackProvider({ children }: PropsWithChildren) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <VideoPlaybackContext.Provider value={{ activeVideoId, setActiveVideoId }}>
      {children}
    </VideoPlaybackContext.Provider>
  );
}

export function useVideoPlayback() {
  return useContext(VideoPlaybackContext);
}
