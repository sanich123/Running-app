import { Host } from '@expo/ui';
import { Button, Label, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  disabled,
  frame,
  foregroundStyle,
  labelStyle as labelStyleModifier,
} from '@expo/ui/swift-ui/modifiers';
import { useTheme } from 'react-native-paper';
import type { ContentActionsMenuProps } from './types';

export default function ContentActionsMenu({
  accessibilityLabel,
  iconColor,
  triggerBackgroundColor,
  testID,
  reportLabel,
  reportTestID,
  onReport,
  showReport = true,
  additionalActions,
  blockLabel,
  blockTestID,
  onBlock,
}: ContentActionsMenuProps) {
  const { colors } = useTheme();

  return (
    <Host
      seedColor={iconColor ?? colors.primary}
      style={[
        styles.host,
        triggerBackgroundColor ? { backgroundColor: triggerBackgroundColor, borderRadius: 20 } : undefined,
      ]}>
      <Menu
        modifiers={[frame({ width: 40, height: 40, alignment: 'center' })]}
        label={
          <Label
            title={accessibilityLabel}
            systemImage="ellipsis"
            modifiers={[
              accessibilityLabelModifier(accessibilityLabel),
              labelStyleModifier('iconOnly'),
              ...(iconColor ? [foregroundStyle(iconColor)] : []),
            ]}
          />
        }
        testID={testID}>
        {showReport ? <Button label={reportLabel} systemImage="flag" testID={reportTestID} onPress={onReport} /> : null}
        {additionalActions?.map((action) => (
          <Button
            key={action.testID}
            label={action.label}
            systemImage={action.systemImage}
            role={action.destructive ? 'destructive' : undefined}
            modifiers={action.disabled ? [disabled(true)] : undefined}
            testID={action.testID}
            onPress={action.onPress}
          />
        ))}
        {onBlock && blockLabel ? (
          <Button
            label={blockLabel}
            systemImage="person.crop.circle.badge.xmark"
            testID={blockTestID}
            onPress={onBlock}
          />
        ) : null}
      </Menu>
    </Host>
  );
}

const styles = {
  host: { alignItems: 'center' as const, height: 40, justifyContent: 'center' as const, width: 40 },
};
