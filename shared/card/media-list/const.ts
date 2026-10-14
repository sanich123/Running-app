import type { VideoPlayer } from 'expo-video';

export const ACTIVITY_MEDIA_ASPECT_RATIO = 5 / 3;
export const ACTIVITY_MEDIA_HEIGHT_RATIO = 0.65;
export const ACTIVITY_MEDIA_MIN_HEIGHT = 220;
export const ACTIVITY_MEDIA_MAX_HEIGHT = 380;

export function formatVideoDuration(duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return '';

  const totalSeconds = Math.round(duration);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function updatePlayerPlayback(player: VideoPlayer, isMuted: boolean, isPaused: boolean) {
  player.muted = isMuted;
  if (isPaused) {
    player.pause();
  } else {
    player.play();
  }
}
