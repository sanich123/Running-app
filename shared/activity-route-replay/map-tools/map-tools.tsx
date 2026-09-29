import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MapControls from '@S/display-activity-map/map-controls/map-controls';
import { ACTIVITY_ROUTE_REPLAY_DURATIONS_MS, ACTIVITY_ROUTE_REPLAY_SPEEDS } from '../const';
import type { MapToolsProps } from '../types';

export default function MapTools({
  mapStyle,
  playbackSpeed,
  playbackDuration,
  copy,
  onZoomIn,
  onZoomOut,
  onMapStyleChange,
  onSetPlaybackSpeed,
  onSetPlaybackDuration,
  canZoomIn,
  canZoomOut,
  isDisabled = false,
}: MapToolsProps) {
  const { colors } = useTheme();

  return (
    <MapControls
      mapStyle={mapStyle}
      copy={copy}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onMapStyleChange={onMapStyleChange}
      canZoomIn={canZoomIn}
      canZoomOut={canZoomOut}
      isDisabled={isDisabled}
      testIdPrefix="activity-route-replay">
      <View
        style={[styles.optionPanel, { backgroundColor: colors.surface }]}
        accessibilityLabel={copy.duration}
        testID="activity-route-replay-map-duration-controls">
        <Icon source="timer-outline" size={16} color={colors.onSurfaceVariant} />
        <View
          style={[styles.optionButtons, { backgroundColor: colors.surfaceVariant }]}
          testID="activity-route-replay-map-duration-buttons">
          {ACTIVITY_ROUTE_REPLAY_DURATIONS_MS.map((duration) => {
            const isSelected = duration === playbackDuration;
            const durationText =
              duration >= 60_000
                ? `${duration / 60_000}${copy.durationMinutesUnit ?? 'm'}`
                : `${duration / 1_000}${copy.durationSecondsUnit ?? 's'}`;

            return (
              <TouchableRipple
                key={duration}
                borderless
                onPress={() => onSetPlaybackDuration(duration)}
                disabled={isDisabled}
                style={[styles.optionButton, isSelected ? { backgroundColor: colors.primary } : null]}
                accessibilityRole="button"
                accessibilityLabel={`${copy.duration}: ${durationText}`}
                accessibilityState={{ selected: isSelected }}
                testID={`activity-route-replay-duration-${duration}`}>
                <Text
                  variant="labelSmall"
                  style={{ color: isSelected ? colors.onPrimary : colors.onSurfaceVariant, fontSize: 10 }}>
                  {durationText}
                </Text>
              </TouchableRipple>
            );
          })}
        </View>
      </View>
      <View
        style={[styles.optionPanel, { backgroundColor: colors.surface }]}
        accessibilityLabel={copy.speed}
        testID="activity-route-replay-map-speed-controls">
        <View
          style={[styles.optionButtons, { backgroundColor: colors.surfaceVariant }]}
          testID="activity-route-replay-map-speed-buttons">
          {ACTIVITY_ROUTE_REPLAY_SPEEDS.map((speed) => {
            const isSelected = speed === playbackSpeed;

            return (
              <TouchableRipple
                key={speed}
                borderless
                onPress={() => onSetPlaybackSpeed(speed)}
                disabled={isDisabled}
                style={[styles.optionButton, isSelected ? { backgroundColor: colors.primary } : null]}
                accessibilityRole="button"
                accessibilityLabel={`${copy.speed}: ${speed}X`}
                accessibilityState={{ selected: isSelected }}
                testID={`activity-route-replay-speed-${String(speed).replace('.', '-')}`}>
                <Text
                  variant="labelSmall"
                  style={{ color: isSelected ? colors.onPrimary : colors.onSurfaceVariant, fontSize: 10 }}>
                  {speed}X
                </Text>
              </TouchableRipple>
            );
          })}
        </View>
      </View>
    </MapControls>
  );
}

const styles = StyleSheet.create({
  optionPanel: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    opacity: 0.9,
    padding: 2,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: 44,
  },
  optionButtons: { alignItems: 'center', borderRadius: 8, flexDirection: 'column', width: 40 },
  optionButton: {
    alignItems: 'center',
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    width: 40,
  },
});
