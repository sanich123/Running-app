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
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

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

  return (
    <View style={{ width, height }} testID={testID}>
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
        accessibilityLabel={isMuted ? unmuteLabel : muteLabel}
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          toggleMute();
        }}
        onPressIn={(event) => event.stopPropagation()}
        style={[styles.muteButton, { backgroundColor: 'rgba(0, 0, 0, 0.62)' }]}
        testID={`${testID}-mute`}>
        <Icon source={isMuted ? 'volume-off' : 'volume-high'} size={20} color="#fff" testID={`${testID}-mute-icon`} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  video: { backgroundColor: '#000' },
  duration: {
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  muteButton: {
    alignItems: 'center',
    borderRadius: 18,
    bottom: 8,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    width: 36,
  },
  overlayText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
