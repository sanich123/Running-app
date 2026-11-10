import { Button, Host, Label, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  disabled,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';
import { useTheme } from 'react-native-paper';
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
  const selectedDurationText = formatDurationOption(playbackDuration, copy);

  return (
    <Host matchContents seedColor={colors.primary}>
      <Menu
        label={
          <Label
            title={selectedDurationText}
            systemImage="chevron.down"
            modifiers={[
              accessibilityLabelModifier(`${copy.duration}: ${selectedDurationText}`),
              foregroundStyle(colors.primary),
            ]}
          />
        }
        modifiers={isDisabled ? [disabled(true)] : undefined}
        testID="activity-route-replay-duration-selector">
        {ACTIVITY_ROUTE_REPLAY_DURATIONS_MS.map((duration) => (
          <Button
            key={duration}
            label={formatDurationOption(duration, copy)}
            systemImage={duration === playbackDuration ? 'checkmark' : undefined}
            modifiers={isDisabled ? [disabled(true)] : undefined}
            testID={`activity-route-replay-duration-${duration}`}
            onPress={() => onSelect(duration)}
          />
        ))}
      </Menu>
    </Host>
  );
}
