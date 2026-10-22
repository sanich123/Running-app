import { Button, Host, Label, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  disabled,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';
import type { ContentActionsMenuProps } from './types';

export default function ContentActionsMenu({
  accessibilityLabel,
  iconColor,
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
  return (
    <Host matchContents>
      <Menu
        label={
          <Label
            systemImage="ellipsis"
            modifiers={[
              accessibilityLabelModifier(accessibilityLabel),
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
