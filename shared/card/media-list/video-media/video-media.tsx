import { useEffect, useId, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import { Icon, Text } from 'react-native-paper';
import MediaThumbnail from '@S/media-thumbnail/media-thumbnail';
import ActiveVideoPlayer from '../active-video-player/active-video-player';
import { formatVideoDuration } from '../const';
import useVideoPlayback from '../use-video-playback';
import type { VideoMediaProps, VideoMetadata } from '../types';

export default function VideoMedia({
  url,
  thumbnail,
  blurhash,
  width,
  height,
  playLabel,
  pauseLabel,
  muteLabel,
  unmuteLabel,
  testID,
  onMetadata,
}: VideoMediaProps) {
  const videoId = useId();
  const isFocused = useIsFocused();
  const { activeVideoId, setActiveVideoId } = useVideoPlayback();
  const isActive = activeVideoId === videoId;
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const isPlaying = isFocused && isActive && !isPaused;
  const handleMetadata = (metadata: VideoMetadata) => {
    if (metadata.duration) {
      const nextDuration = metadata.duration;
      setDuration((currentDuration) => (currentDuration === nextDuration ? currentDuration : nextDuration));
    }
    onMetadata?.(metadata);
  };

  useEffect(
    () => () => setActiveVideoId((current) => (current === videoId ? null : current)),
    [setActiveVideoId, videoId],
  );

  useEffect(() => {
    if (isFocused) return;

    setActiveVideoId((current) => (current === videoId ? null : current));
  }, [isFocused, setActiveVideoId, videoId]);

  return (
    <View style={[styles.container, { width, height }]} testID={testID}>
      {isActive ? (
        <ActiveVideoPlayer url={url} isMuted={isMuted} isPaused={!isFocused || isPaused} onMetadata={handleMetadata} />
      ) : (
        <MediaThumbnail
          mediaUrl={url}
          thumbnail={thumbnail}
          isVideo
          style={StyleSheet.absoluteFill}
          testID={testID + '-thumbnail'}
          placeholder={blurhash}
          onLoad={({ source: { width: loadedWidth, height: loadedHeight } }) => {
            if (loadedWidth > 0 && loadedHeight > 0) {
              handleMetadata({ aspectRatio: loadedWidth / loadedHeight });
            }
          }}
        />
      )}
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
          if (isActive) {
            setIsPaused((current) => !current);
          } else {
            setIsPaused(false);
            setActiveVideoId(videoId);
          }
        }}
        onPressIn={(event) => event.stopPropagation()}
        style={[styles.controlButton, styles.playButton]}
        testID={testID + '-play'}>
        <Icon source={isPlaying ? 'pause' : 'play'} size={20} color="#fff" testID={testID + '-play-icon'} />
      </Pressable>
      <Pressable
        accessibilityLabel={isMuted ? unmuteLabel : muteLabel}
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          setIsMuted((current) => !current);
        }}
        onPressIn={(event) => event.stopPropagation()}
        style={[styles.controlButton, styles.muteButton]}
        testID={testID + '-mute'}>
        <Icon source={isMuted ? 'volume-off' : 'volume-high'} size={20} color="#fff" testID={testID + '-mute-icon'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', overflow: 'hidden' },
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
