import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

interface VideoPlaybackContextValue {
  activeVideoId: string | null;
  setActiveVideoId: Dispatch<SetStateAction<string | null>>;
}

export const VideoPlaybackContext = createContext<VideoPlaybackContextValue>({
  activeVideoId: null,
  setActiveVideoId: () => undefined,
});
