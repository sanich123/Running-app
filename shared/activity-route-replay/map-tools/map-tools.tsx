import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MapControls from '@S/display-activity-map/map-controls/map-controls';
import { getMapControlButtonSize, getMapControlButtonStyle } from '@S/map-control-button/const';
import { ACTIVITY_ROUTE_REPLAY_DURATIONS_MS } from '../const';
import { formatDurationOption } from './utils';
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
  const { width } = useWindowDimensions();
  const durationButtonSize = getMapControlButtonSize(width);
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
            style={getMapControlButtonStyle(durationButtonSize)}
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
                style={[styles.durationSelectorText, { color: colors.primary }]}>
                {selectedDurationText}
              </Text>
              {Platform.OS === 'ios' ? (
                <SymbolView name="chevron.down" size={12} tintColor={colors.primary} />
              ) : (
                <Icon source="chevron-down" size={12} color={colors.primary} />
              )}
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

const styles = StyleSheet.create({
  durationSelectorContent: { alignItems: 'center', justifyContent: 'center' },
  durationSelectorText: { fontSize: 11, lineHeight: 14 },
  durationMenu: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 4, paddingVertical: 4 },
  durationMenuItem: { borderRadius: 8, height: 36, marginHorizontal: 2, minWidth: 112 },
  durationMenuItemTitle: { fontSize: 13 },
  durationMenuItemTitleSelected: { fontWeight: '700' },
});
