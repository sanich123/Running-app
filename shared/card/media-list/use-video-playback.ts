import { useContext } from 'react';
import { VideoPlaybackContext } from './video-playback-context';

export default function useVideoPlayback() {
  return useContext(VideoPlaybackContext);
}
