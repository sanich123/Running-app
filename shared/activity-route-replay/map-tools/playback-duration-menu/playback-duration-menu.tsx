import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { getMapControlButtonSize, getMapControlButtonStyle } from '@S/map-control-button/const';
import { ACTIVITY_ROUTE_REPLAY_DURATIONS_MS } from '../../const';
import { formatDurationOption } from '../utils';
import type { PlaybackDurationMenuProps } from './types';

export default function PlaybackDurationMenu({
  playbackDuration,
  copy,
  isDisabled,
  onSelect,
}: PlaybackDurationMenuProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const durationButtonSize = getMapControlButtonSize(width);
  const selectedDurationText = formatDurationOption(playbackDuration, copy);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchorPosition="bottom"
      elevation={3}
      contentStyle={[styles.durationMenu, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
      anchor={
        <TouchableRipple
          style={getMapControlButtonStyle(durationButtonSize)}
          onPress={() => setVisible(true)}
          disabled={isDisabled}
          accessibilityLabel={`${copy.duration}: ${selectedDurationText}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: visible }}
          testID="activity-route-replay-duration-selector">
          <View style={styles.durationSelectorContent}>
            <Text
              variant="labelSmall"
              numberOfLines={1}
              style={[styles.durationSelectorText, { color: colors.primary }]}>
              {selectedDurationText}
            </Text>
            <Icon source="chevron-down" size={12} color={colors.primary} />
          </View>
        </TouchableRipple>
      }>
      {ACTIVITY_ROUTE_REPLAY_DURATIONS_MS.map((duration) => (
        <Menu.Item
          key={duration}
          title={formatDurationOption(duration, copy)}
          dense
          leadingIcon={duration === playbackDuration ? 'check' : undefined}
          disabled={isDisabled}
          testID={`activity-route-replay-duration-${duration}`}
          onPress={() => {
            setVisible(false);
            onSelect(duration);
          }}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  durationSelectorContent: { alignItems: 'center', justifyContent: 'center' },
  durationSelectorText: { fontSize: 11, lineHeight: 14 },
  durationMenu: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 4, paddingVertical: 4 },
});
