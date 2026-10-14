import { useEffect, useRef } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';
import { updatePlayerPlayback } from '../const';
import type { ActiveVideoPlayerProps, VideoMetadata } from '../types';

export default function ActiveVideoPlayer({ url, isMuted, isPaused, onMetadata }: ActiveVideoPlayerProps) {
  const player = useVideoPlayer(url, (currentPlayer) => {
    currentPlayer.loop = true;
    currentPlayer.muted = true;
  });
  const onMetadataRef = useRef(onMetadata);

  useEffect(() => {
    onMetadataRef.current = onMetadata;
  }, [onMetadata]);

  useEffect(() => {
    updatePlayerPlayback(player, isMuted, isPaused);
  }, [isMuted, isPaused, player]);

  useEffect(() => () => player.pause(), [player]);

  useEffect(() => {
    const updateMetadata = () => {
      const duration = player.duration;
      const videoSize = player.videoTrack?.size;
      const metadata: VideoMetadata = {};

      if (Number.isFinite(duration) && duration > 0) metadata.duration = duration;
      if (videoSize?.width && videoSize?.height) metadata.aspectRatio = videoSize.width / videoSize.height;
      if (metadata.duration || metadata.aspectRatio) onMetadataRef.current?.(metadata);
    };

    updateMetadata();
    const sourceSubscription = player.addListener('sourceLoad', updateMetadata);
    const trackSubscription = player.addListener('videoTrackChange', updateMetadata);
    return () => {
      sourceSubscription.remove();
      trackSubscription.remove();
    };
  }, [player]);

  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}
