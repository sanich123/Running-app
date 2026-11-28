import { Host } from '@expo/ui';
import { Button, Label, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  contentShape,
  disabled,
  frame,
  foregroundStyle,
  labelStyle as labelStyleModifier,
  shapes,
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
  const hasActions = showReport || !!additionalActions?.length || (!!onBlock && !!blockLabel);

  return hasActions ? (
    <Host
      seedColor={colors.primary}
      style={[
        styles.host,
        triggerBackgroundColor ? { backgroundColor: triggerBackgroundColor, borderRadius: 22 } : undefined,
      ]}>
      <Menu
        modifiers={[frame({ width: 44, height: 44, alignment: 'center' }), contentShape(shapes.rectangle())]}
        label={
          <Label
            title={accessibilityLabel}
            systemImage="ellipsis"
            modifiers={[
              accessibilityLabelModifier(accessibilityLabel),
              labelStyleModifier('iconOnly'),
              frame({ width: 44, height: 44, alignment: 'center' }),
              contentShape(shapes.rectangle()),
              ...(iconColor ? [foregroundStyle(iconColor)] : []),
            ]}
          />
        }
        testID={testID}>
        {showReport ? <Button label={reportLabel} systemImage="flag" testID={reportTestID} onPress={onReport} /> : null}
        {additionalActions?.map((action) => (
          <Button
            key={action.testID}
            label={action.destructive ? undefined : action.label}
            systemImage={action.destructive ? undefined : action.systemImage}
            role={action.destructive ? 'destructive' : undefined}
            modifiers={action.disabled ? [disabled(true)] : undefined}
            testID={action.testID}
            onPress={action.onPress}>
            {action.destructive ? (
              <Label
                title={action.label}
                systemImage={action.systemImage}
                modifiers={[foregroundStyle(colors.error)]}
              />
            ) : undefined}
          </Button>
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
  ) : null;
}

const styles = {
  host: { alignItems: 'center' as const, height: 44, justifyContent: 'center' as const, width: 44, zIndex: 1 },
};
