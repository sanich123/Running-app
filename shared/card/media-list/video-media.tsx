import { useEffect, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import type { VideoPlayer } from 'expo-video';

interface VideoMediaProps {
  url: string;
  width: number;
  height: number;
  isActive: boolean;
  playLabel: string;
  pauseLabel: string;
  muteLabel: string;
  unmuteLabel: string;
  testID: string;
  onMetadata?: (metadata: { duration?: number; aspectRatio?: number }) => void;
}

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

function setPlayerMuted(player: VideoPlayer, muted: boolean) {
  player.muted = muted;
}

export default function VideoMedia({
  url,
  width,
  height,
  isActive,
  playLabel,
  pauseLabel,
  muteLabel,
  unmuteLabel,
  testID,
  onMetadata,
}: VideoMediaProps) {
  const player = useVideoPlayer(url, (currentPlayer) => {
    currentPlayer.loop = true;
    currentPlayer.muted = true;
  });
  const [isMuted, setIsMuted] = useState(true);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isActive && !isUserPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isUserPaused, player]);

  useEffect(() => {
    const updateMetadata = () => {
      const nextDuration = player.duration;
      const nextVideoSize = player.videoTrack?.size;

      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        setDuration(nextDuration);
        onMetadata?.({ duration: nextDuration });
      }

      const videoWidth = nextVideoSize?.width;
      const videoHeight = nextVideoSize?.height;
      if (videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0) {
        onMetadata?.({ aspectRatio: videoWidth / videoHeight });
      }
    };

    updateMetadata();
    const sourceSubscription = player.addListener('sourceLoad', updateMetadata);
    const trackSubscription = player.addListener('videoTrackChange', updateMetadata);

    return () => {
      sourceSubscription.remove();
      trackSubscription.remove();
    };
  }, [onMetadata, player]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setPlayerMuted(player, nextMuted);
    setIsMuted(nextMuted);
  };

  const togglePlay = () => setIsUserPaused((current) => !current);
  const isPlaying = isActive && !isUserPaused;

  return (
    <View style={[styles.container, { width, height }]} testID={testID}>
      <VideoView
        player={player}
        style={[StyleSheet.absoluteFill, styles.video]}
        contentFit="cover"
        nativeControls={false}
      />
      {duration > 0 ? (
        <View style={styles.duration} pointerEvents="none">
          <Text style={styles.overlayText}>{formatVideoDuration(duration)}</Text>
        </View>
      ) : null}
      <Pressable
        accessibilityLabel={isPlaying ? pauseLabel : playLabel}
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          togglePlay();
        }}
        onPressIn={(event) => event.stopPropagation()}
        style={[styles.controlButton, styles.playButton]}
        testID={`${testID}-play`}>
        <Icon source={isPlaying ? 'pause' : 'play'} size={20} color="#fff" testID={`${testID}-play-icon`} />
      </Pressable>
      <Pressable
        accessibilityLabel={isMuted ? unmuteLabel : muteLabel}
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          toggleMute();
        }}
        onPressIn={(event) => event.stopPropagation()}
        style={[styles.controlButton, styles.muteButton]}
        testID={`${testID}-mute`}>
        <Icon source={isMuted ? 'volume-off' : 'volume-high'} size={20} color="#fff" testID={`${testID}-mute-icon`} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  video: { backgroundColor: '#000' },
  duration: {
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    borderRadius: 10,
    bottom: 8,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    width: 36,
  },
  playButton: { left: 8 },
  muteButton: { right: 8 },
  overlayText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
