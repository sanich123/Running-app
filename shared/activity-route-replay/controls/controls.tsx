import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { formatDuration, formatDurationMinsSecs } from '@U/time-formatter';
import type { ControlsProps } from '../types';

export default function Controls({
  progress,
  hasStarted,
  isPlaying,
  playbackTime,
  playbackDuration,
  workoutTime,
  currentSpeed,
  isDisabled = false,
  isVideoExportAvailable = false,
  isExporting = false,
  copy,
  onTogglePlayback,
  onShareVideo = () => undefined,
  onSeekStart,
  onSeek,
  onSeekEnd,
}: ControlsProps) {
  const { colors } = useTheme();
  const seekWidthRef = useRef(0);

  const handleSeek = (locationX: number) => {
    if (!seekWidthRef.current) return;
    onSeek(locationX / seekWidthRef.current);
  };

  const handleSeekAccessibilityAction = (actionName: string) => {
    const offset = actionName === 'increment' ? 0.05 : actionName === 'decrement' ? -0.05 : 0;
    onSeek(progress + offset);
  };

  return (
    <View pointerEvents={isDisabled ? 'none' : 'box-none'} style={styles.overlay}>
      <View style={[styles.controls, { backgroundColor: colors.surface }]}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text numberOfLines={1} style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              {copy.playbackTime}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={[styles.statValue, { color: colors.onSurface }]}>
              {formatDurationMinsSecs(playbackTime)} / {formatDurationMinsSecs(playbackDuration)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text numberOfLines={1} style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              {copy.workoutTime}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={[styles.statValue, { color: colors.onSurface }]}>
              {formatDuration(workoutTime)}
            </Text>
          </View>
          <View style={[styles.stat, styles.speedStat]}>
            <Text numberOfLines={1} style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              {copy.currentSpeed}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={[styles.statValue, { color: colors.onSurface }]}>
              {currentSpeed === null ? '—' : `${(currentSpeed * 3.6).toFixed(1)} ${copy.kmh}`}
            </Text>
          </View>
        </View>
        <View style={styles.playbackRow}>
          <IconButton
            icon={isPlaying ? 'pause' : 'play'}
            iconColor={colors.primary}
            size={30}
            style={styles.playbackButton}
            onPress={onTogglePlayback}
            disabled={isDisabled}
            accessibilityLabel={
              progress >= 1 ? copy.replay : isPlaying ? copy.pause : hasStarted ? copy.resume : copy.play
            }
            testID="activity-route-replay-toggle"
          />
          <View style={styles.seekHitbox}>
            <View
              style={styles.seekBar}
              testID="activity-route-replay-seekbar"
              onLayout={(event) => {
                seekWidthRef.current = event.nativeEvent.layout.width;
              }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(event) => {
                onSeekStart();
                handleSeek(event.nativeEvent.locationX);
              }}
              onResponderMove={(event) => handleSeek(event.nativeEvent.locationX)}
              onResponderRelease={(event) => {
                handleSeek(event.nativeEvent.locationX);
                onSeekEnd();
              }}
              onResponderTerminate={onSeekEnd}
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(event) => handleSeekAccessibilityAction(event.nativeEvent.actionName)}
              accessibilityRole="adjustable"
              accessibilityLabel={copy.position}
              accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
              <View style={[styles.seekTrack, { backgroundColor: colors.surfaceVariant }]}>
                <View style={[styles.seekFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
                <View
                  style={[styles.seekThumb, { backgroundColor: colors.primary, left: `${progress * 100}%` }]}
                  testID="activity-route-replay-seek-thumb"
                />
              </View>
            </View>
          </View>
          {isVideoExportAvailable ? (
            <IconButton
              icon="share-variant"
              iconColor={colors.primary}
              size={22}
              style={styles.shareButton}
              loading={isExporting}
              disabled={isDisabled || isExporting}
              onPress={onShareVideo}
              accessibilityLabel={copy.shareVideo}
              testID="activity-route-replay-share-video"
            />
          ) : null}
        </View>
        {isVideoExportAvailable && copy.videoExportHint ? (
          <Text style={[styles.videoExportHint, { color: colors.onSurfaceVariant }]}>{copy.videoExportHint}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  controls: {
    borderRadius: 16,
    bottom: 16,
    elevation: 6,
    left: 12,
    paddingHorizontal: 10,
    paddingTop: 8,
    position: 'absolute',
    right: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 4, paddingBottom: 2 },
  stat: { flex: 1, minWidth: 0 },
  speedStat: { flexGrow: 0.75 },
  statLabel: { fontSize: 10, lineHeight: 14 },
  statValue: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  playbackRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  seekHitbox: { flex: 1 },
  seekBar: { flex: 1, justifyContent: 'center', minHeight: 40 },
  seekTrack: { borderRadius: 4, height: 4, overflow: 'visible', width: '100%' },
  seekFill: { borderRadius: 4, height: '100%' },
  seekThumb: {
    borderColor: '#fff',
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    position: 'absolute',
    top: -5,
    transform: [{ translateX: -7 }],
    width: 14,
  },
  playbackButton: { height: 48, margin: 0, width: 48 },
  shareButton: { height: 48, margin: 0, width: 48 },
  videoExportHint: { fontSize: 9, lineHeight: 13, paddingBottom: 8, paddingHorizontal: 7, textAlign: 'center' },
});
