import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MapControls from '@S/display-activity-map/map-controls/map-controls';
import { ACTIVITY_ROUTE_REPLAY_DURATIONS_MS } from '../const';
import type { MapToolsProps } from '../types';

export default function MapTools({
  mapStyle,
  playbackDuration,
  copy,
  onZoomIn,
  onZoomOut,
  onMapStyleChange,
  onSetPlaybackDuration,
  canZoomIn,
  canZoomOut,
  bottomOffset,
  isDisabled = false,
}: MapToolsProps) {
  const { colors } = useTheme();
  const [isDurationMenuVisible, setIsDurationMenuVisible] = useState(false);
  const selectedDurationText = formatDurationOption(playbackDuration, copy);

  return (
    <MapControls
      mapStyle={mapStyle}
      copy={copy}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onMapStyleChange={onMapStyleChange}
      canZoomIn={canZoomIn}
      canZoomOut={canZoomOut}
      bottomOffset={bottomOffset}
      isDisabled={isDisabled}
      testIdPrefix="activity-route-replay">
      <Menu
        visible={isDurationMenuVisible}
        onDismiss={() => setIsDurationMenuVisible(false)}
        anchorPosition="bottom"
        elevation={3}
        contentStyle={[styles.durationMenu, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
        anchor={
          <TouchableRipple
            style={[styles.durationSelector, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => setIsDurationMenuVisible(true)}
            disabled={isDisabled}
            accessibilityLabel={`${copy.duration}: ${selectedDurationText}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: isDurationMenuVisible }}
            testID="activity-route-replay-duration-selector">
            <View style={styles.durationSelectorContent}>
              <Text
                variant="labelSmall"
                numberOfLines={1}
                style={[styles.durationSelectorText, { color: colors.onSurface }]}>
                {selectedDurationText}
              </Text>
              <Icon source="chevron-down" size={12} color={colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>
        }>
        {ACTIVITY_ROUTE_REPLAY_DURATIONS_MS.map((duration) => {
          const isSelected = duration === playbackDuration;
          const durationText = formatDurationOption(duration, copy);

          return (
            <Menu.Item
              key={duration}
              title={durationText}
              dense
              leadingIcon={isSelected ? 'check' : undefined}
              style={[styles.durationMenuItem, isSelected ? { backgroundColor: colors.primaryContainer } : undefined]}
              titleStyle={[
                styles.durationMenuItemTitle,
                { color: isSelected ? colors.onPrimaryContainer : colors.onSurface },
                isSelected ? styles.durationMenuItemTitleSelected : undefined,
              ]}
              disabled={isDisabled}
              onPress={() => {
                onSetPlaybackDuration(duration);
                setIsDurationMenuVisible(false);
              }}
              accessibilityLabel={`${copy.duration}: ${durationText}`}
              accessibilityState={{ selected: isSelected }}
              testID={`activity-route-replay-duration-${duration}`}
            />
          );
        })}
      </Menu>
    </MapControls>
  );
}

function formatDurationOption(duration: number, copy: MapToolsProps['copy']) {
  return duration >= 60_000
    ? `${duration / 60_000}${copy.durationMinutesUnit ?? 'm'}`
    : `${duration / 1_000}${copy.durationSecondsUnit ?? 's'}`;
}

const styles = StyleSheet.create({
  durationSelector: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    height: 44,
    justifyContent: 'center',
    margin: 0,
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: 44,
  },
  durationSelectorContent: { alignItems: 'center', justifyContent: 'center' },
  durationSelectorText: { fontSize: 10, lineHeight: 13 },
  durationMenu: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 4, paddingVertical: 4 },
  durationMenuItem: { borderRadius: 8, height: 36, marginHorizontal: 2, minWidth: 112 },
  durationMenuItemTitle: { fontSize: 13 },
  durationMenuItemTitleSelected: { fontWeight: '700' },
});
